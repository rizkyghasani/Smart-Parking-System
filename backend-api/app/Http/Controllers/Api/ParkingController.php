<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use App\Models\ParkingTransaction;
use App\Models\RevenueConfig;
use App\Models\Customer;
use App\Events\SlotUpdated;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use App\Services\DijkstraService; // ➕ 1. Import Service Dijkstra kita
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ParkingController extends Controller
{
    protected $dijkstraService;

    // ➕ 2. Inject DijkstraService melalui Constructor
    public function __construct(DijkstraService $dijkstraService)
    {
        $this->dijkstraService = $dijkstraService;
    }

    public function getSlots()
    {
        $slots = ParkingSlot::all();
        $candidates = $this->dijkstraService->getAllCandidatesWithDijkstra();
        // 🛠️ UPDATE: priority_weight sudah dihapus, kita urutkan berdasarkan slot_code (S1, S2, dst.)
        //$slots = ParkingSlot::orderBy('slot_code', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $slots,
            'candidates' => $candidates
        ]);
    }

    public function tapIn(Request $request)
    {
        // 1. Validasi input dari Kamera AI (Frontend)
        $request->validate([
            'plate_number' => 'required|string',
            'card_id'      => 'nullable|string' // Opsional jika pakai RFID
        ]);

        $plate = $request->plate_number;

        // 2. 🧠 FALLBACK LOGIC: Deteksi Status Pengunjung
        $customer = Customer::where('registered_plate_number', $plate)->first();
        $customerId = $customer ? $customer->id : null;

        // 3. 🗺️ ALOKASI CERDAS (DIJKSTRA ALGORITHM)
        // Memanggil service yang akan mengkalkulasi rute terpendek dari Exit
        $slot = $this->dijkstraService->findOptimalSlot();

        if (!$slot) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Mohon maaf, area parkir penuh.'
            ], 400);
        }

        // 4. Eksekusi Transaksi & Kunci Slot
        $slot->update(['status' => 'occupied']);

        $transaction = ParkingTransaction::create([
            'card_id'         => $request->card_id ?? 'TCK-' . strtoupper(Str::random(8)),
            'plate_number'    => $plate,
            'parking_slot_id' => $slot->id,
            'customer_id'     => $customerId,
            'entry_time'      => now(),
        ]);

        // 5. Trigger event Laravel Reverb untuk update UI di Frontend
        broadcast(new SlotUpdated($slot))->toOthers();

        return response()->json([
            'status'  => 'success',
            'message' => 'Akses gerbang terbuka.',
            'data'    => [
                'transaction' => $transaction,
                'allocated_slot' => $slot->slot_code // Mengirimkan info slot ke gerbang
            ]
        ]);
    }

    public function tapOut(Request $request)
    {
        $slot = ParkingSlot::find($request->slot_id);

        if ($slot && ($slot->status === 'occupied' || $slot->status === 'violation')) {
            
            // 💰 1. Ambil konfigurasi tarif per jam yang sedang aktif
            $currentConfig = RevenueConfig::orderBy('effective_from', 'desc')
                ->orderBy('id', 'desc')
                ->first();

            if (!$currentConfig) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tarif parkir aktif belum diatur oleh administrator.'
                ], 400);
            }

            return DB::transaction(function () use ($slot, $currentConfig) {
                
                $transaction = ParkingTransaction::where('parking_slot_id', $slot->id)
                    ->whereNull('exit_time')
                    ->latest()
                    ->first();

                if ($transaction) {
                    $entryTime = Carbon::parse($transaction->entry_time);
                    $exitTime  = Carbon::now();

                    // ⏳ 2. Hitung total durasi
                    $durationMinutes = (int) ceil($entryTime->diffInMinutes($exitTime));
                    if ($durationMinutes === 0) {
                        $durationMinutes = 1;
                    }
                    
                    $durationHours = (int) ceil($durationMinutes / 60);
                    if ($durationHours === 0) {
                        $durationHours = 1; 
                    }

                    // 🧠 3. LOGIKA PENENTUAN TARIF
                    $totalFee = 0;
                    $isMember = false;

                    if ($transaction->customer_id) {
                        $customer = $transaction->customer;
                        if ($customer && $customer->member && $customer->member->is_active) {
                            $expiredAt = Carbon::parse($customer->member->expired_at);
                            if ($expiredAt->isAfter(now())) {
                                $isMember = true;
                            }
                        }
                    }

                    if ($isMember) {
                        $totalFee = 0;
                    } else {
                        $totalFee = $durationHours * $currentConfig->rate_per_hour;
                    }

                    // 📝 4. Update data transaksi
                    $transaction->update([
                        'exit_time'          => $exitTime,
                        'duration_minutes'   => $durationMinutes,
                        'fee'                => $totalFee,
                        'revenue_config_id'  => $currentConfig->id,
                        'is_member'          => $isMember
                    ]);
                }

                // 5. Kembalikan status fisik slot menjadi kosong
                $slot->update(['status' => 'available']);
                
                broadcast(new SlotUpdated($slot))->toOthers();

                return response()->json([
                    'status'       => 'success',
                    'plate_number' => $transaction?->plate_number ?? 'Tidak diketahui',
                    'exit_time'    => $transaction?->exit_time ? Carbon::parse($transaction->exit_time)->toTimeString() : now()->toTimeString(),
                    'duration'     => isset($durationHours) ? "{$durationHours} Jam" : "1 Jam",
                    'total_fee'    => $totalFee ?? 0,
                    'is_member'    => $isMember ?? false
                ]);
            });
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Slot tidak ditemukan atau sudah kosong'
        ], 400);
    }

    public function validateSlot(Request $request)
    {
        $request->validate([
            'slot_code' => 'required',
            'detected_plate' => 'required'
        ]);

        $slot = ParkingSlot::where('slot_code', $request->slot_code)->first();
        
        if (!$slot) return response()->json(['message' => 'Slot not found'], 404);

        $activeTransaction = ParkingTransaction::where('parking_slot_id', $slot->id)
            ->whereNull('exit_time')
            ->latest()
            ->first();

        if ($activeTransaction) {
            $registeredPlate = $activeTransaction->plate_number;
            
            $cleanRegistered = preg_replace('/[^A-Z0-9]/', '', strtoupper($registeredPlate));
            $cleanDetected = preg_replace('/[^A-Z0-9]/', '', strtoupper($request->detected_plate));

            if ($cleanRegistered !== $cleanDetected) {
                // 🛠️ FIXED: Menggunakan $activeTransaction, bukan $transaction
                $activeTransaction->update(['is_violation' => true]); 
                broadcast(new SlotUpdated($slot))->toOthers();
                
                return response()->json([
                    'status' => 'mismatch',
                    'message' => "ALARM: Plat $cleanDetected tidak sesuai database $cleanRegistered!"
                ]);
            }
        }

        return response()->json(['status' => 'valid']);
    }

    /**
     * Simulasi Deteksi Kamera IoT / Klik Manual User
     */
    public function simulateSensor(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:parking_transactions,id',
            'detected_slot_id' => 'required|exists:parking_slots,id',
        ]);

        try {
            DB::beginTransaction();

            $transaction = ParkingTransaction::findOrFail($request->transaction_id);
            $detectedSlot = ParkingSlot::lockForUpdate()->findOrFail($request->detected_slot_id);
            $allocatedSlot = ParkingSlot::lockForUpdate()->findOrFail($transaction->parking_slot_id);

            // 🚨 SKENARIO PELANGGARAN: User klik slot yang BEDA dengan alokasi sistem
            if ($detectedSlot->id !== $allocatedSlot->id) {
                
                $detectedSlot->update(['status' => 'violation']);

                // 🌟 BARU: catat link transaksi → slot fisik yang salah
                $transaction->update([
                    'detected_slot_id' => $detectedSlot->id,
                    'is_violation'     => true,
                ]);

                Notification::create([
                    'type' => 'violation',
                    'title' => 'Pelanggaran Lokasi!',
                    'body' => "Plat {$transaction->plate_number} parkir di {$detectedSlot->slot_code} (Seharusnya di {$allocatedSlot->slot_code}).",
                    'to_user_id' => null,
                    'transaction_id' => $transaction->id,
                ]);

                broadcast(new SlotUpdated($detectedSlot));
                
                DB::commit();
                return response()->json([
                    'success' => true, 
                    'message' => 'PERINGATAN: Anda menempati slot yang salah! Petugas telah dinotifikasi.'
                ]);
            }

            // ✅ SKENARIO NORMAL: User klik slot yang BENAR (Sesuai alokasi)
            if ($detectedSlot->status !== 'occupied') {
                $detectedSlot->update(['status' => 'occupied']);
                broadcast(new SlotUpdated($detectedSlot));
            }

            // 🌟 BARU: reset link kalau sebelumnya sempat violation lalu klik ulang slot yang benar
            $transaction->update([
                'detected_slot_id' => $detectedSlot->id,
                'is_violation'     => false,
            ]);
            
            DB::commit();
            return response()->json([
                'success' => true, 
                'message' => 'Terima kasih, posisi parkir Anda sesuai.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal sinkronisasi sensor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Guest/Customer meminta bantuan petugas untuk tap-out manual
     * (kasus plat tidak terbaca / masuk pakai e-money tanpa plat).
     */
    public function requestManualTapOut(Request $request)
    {
        $request->validate([
            'slot_id' => 'required|exists:parking_slots,id',
        ]);

        $slot = ParkingSlot::findOrFail($request->slot_id);

        $transaction = ParkingTransaction::where('parking_slot_id', $slot->id)
            ->whereNull('exit_time')
            ->latest()
            ->first();

        if (!$transaction) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tidak ditemukan transaksi aktif di slot ini.'
            ], 404);
        }

        Notification::create([
            'type'           => 'manual_tapout_request',
            'title'          => 'Permintaan Tap-Out Manual',
            'body'           => "Kendaraan di Slot {$slot->slot_code} meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).",
            'to_user_id'     => null, // broadcast ke semua staff
            'transaction_id' => $transaction->id,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Permintaan terkirim ke petugas. Mohon tunggu sebentar di lokasi slot Anda.'
        ]);
    }

}