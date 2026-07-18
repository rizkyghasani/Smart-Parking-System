<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use App\Models\ParkingTransaction;
use App\Models\RevenueConfig; // ➕ 1. Import model RevenueConfig
use App\Models\Customer;
use App\Events\SlotUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // ➕ 2. Import Carbon untuk presisi perhitungan jam

class ParkingController extends Controller
{
    public function getSlots()
    {
        $slots = ParkingSlot::orderBy('priority_weight', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $slots
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
        // Sistem mencari apakah plat nomor ini ada di tabel customers
        $customer = Customer::where('registered_plate_number', $plate)->first();
        
        // Jika ketemu, ambil ID-nya. Jika tidak (Guest), biarkan null.
        $customerId = $customer ? $customer->id : null;

        // 3. Alokasi Slot Parkir (Contoh: mengambil slot kosong pertama)
        // Nanti bisa kamu sesuaikan dengan algoritma Priority Weight skripsimu
        $slot = ParkingSlot::where('status', 'available')->orderBy('priority_weight')->first();

        if (!$slot) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Mohon maaf, area parkir penuh.'
            ], 400);
        }

        // 4. Eksekusi Transaksi & Kunci Slot
        $slot->update(['status' => 'occupied']);

        $transaction = ParkingTransaction::create([
            // Generate kode tiket acak jika tidak ada tap kartu fisik
            'card_id'         => $request->card_id ?? 'TCK-' . strtoupper(Str::random(8)),
            'plate_number'    => $plate,
            'parking_slot_id' => $slot->id,
            'customer_id'     => $customerId, // 👈 Disinilah magisnya bekerja
            'entry_time'      => now(),
        ]);

        // 5. (Opsional) Trigger event Laravel Reverb untuk update UI di Frontend
        // broadcast(new SlotUpdated($slot));
            
            broadcast(new SlotUpdated($slot))->toOthers();

        return response()->json([
            'status'  => 'success',
            'message' => 'Akses gerbang terbuka.',
            'data'    => $transaction
        ]);
    }

    public function tapOut(Request $request)
    {
        $slot = ParkingSlot::find($request->slot_id);

        if ($slot && ($slot->status === 'occupied' || $slot->status === 'violation')) {
            
            // 💰 1. Ambil konfigurasi tarif per jam yang sedang aktif dari database (Sesuai skema lamamu)
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

                    // ⏳ 2. Hitung total durasi menit rill dan bulatkan menjadi Integer bulat
                    $durationMinutes = (int) ceil($entryTime->diffInMinutes($exitTime));
                    if ($durationMinutes === 0) {
                        $durationMinutes = 1;
                    }
                    
                    // 📐 Konversi ke jam dengan pembulatan ke atas untuk skema biaya progresif
                    $durationHours = (int) ceil($durationMinutes / 60);
                    if ($durationHours === 0) {
                        $durationHours = 1; 
                    }

                    // 🧠 3. LOGIKA PENENTUAN TARIF (Membership vs Guest)
                    $totalFee = 0;
                    $isMember = false;

                    // Cek apakah transaksi ini terikat dengan customer terdaftar
                    if ($transaction->customer_id) {
                        $customer = $transaction->customer;
                        if ($customer && $customer->member && $customer->member->is_active) {
                            $expiredAt = Carbon::parse($customer->member->expired_at);
                            // Pastikan masa berlaku keanggotaan belum kedaluwarsa
                            if ($expiredAt->isAfter(now())) {
                                $isMember = true;
                            }
                        }
                    }

                    if ($isMember) {
                        // Hak Istimewa: Anggota aktif mendapatkan tarif flat gratis (Rp 0)
                        $totalFee = 0;
                    } else {
                        // Pengguna Umum (Guest): Hitung tarif progresif
                        $totalFee = $durationHours * $currentConfig->rate_per_hour;
                    }

                    // 📝 4. Update data transaksi rill ke PostgreSQL
                    $transaction->update([
                        'exit_time'          => $exitTime,
                        'duration_minutes'   => $durationMinutes,
                        'fee'                => $totalFee,
                        'revenue_config_id'  => $currentConfig->id,
                        'is_member'          => $isMember
                    ]);
                }

                // 5. Kembalikan status fisik slot menjadi kosong (available)
                $slot->update(['status' => 'available']);
                
                // (Opsional) Trigger event Reverb
                // broadcast(new SlotUpdated($slot))->toOthers();

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

    private function formatDuration($totalMinutes)
    {
        $hours = floor($totalMinutes / 60);
        $minutes = $totalMinutes % 60;

        if ($hours > 0) {
            return "{$hours} Jam {$minutes} Menit";
        }
        return "{$minutes} Menit";
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
                $transaction->update(['is_violation' => true]);
                broadcast(new SlotUpdated($slot))->toOthers();
                
                return response()->json([
                    'status' => 'mismatch',
                    'message' => "ALARM: Plat $cleanDetected tidak sesuai database $cleanRegistered!"
                ]);
            }
        }

        return response()->json(['status' => 'valid']);
    }
}