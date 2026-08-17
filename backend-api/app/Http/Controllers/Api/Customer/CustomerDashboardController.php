<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;
use Carbon\Carbon;

// 🌟 Import Model dan Service yang dibutuhkan
use App\Services\DijkstraService;
use App\Models\ParkingTransaction;
use App\Models\ParkingSlot;
use App\Events\SlotUpdated;

class CustomerDashboardController extends Controller
{
    protected $dijkstraService;

    // 🌟 1. Inject DijkstraService melalui constructor
    public function __construct(DijkstraService $dijkstraService)
    {
        $this->dijkstraService = $dijkstraService;
    }

    // 🌟 2. Endpoint Dashboard (Diperbarui untuk mengecek Transaksi Aktif)
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'User tidak terautentikasi'], 401);
            }

            // 1. Load profil & member
            $user->load(['customer.member']);
            $customer = $user->customer;

            // 2. 🌟 PERBAIKAN: Paksa limit menjadi tipe data Integer
            $limit = (int) $request->query('limit', 10);

            $transactions = [];
            $activeTransaction = null;

            if ($customer) {
                // 3. 🌟 PERBAIKAN: Gunakan 'slot' sesuai bawaan modelmu
                $activeTransaction = ParkingTransaction::with('slot') 
                    ->where('customer_id', $customer->id)
                    ->whereNull('exit_time')
                    ->first();

                $transactions = ParkingTransaction::with('slot') 
                    ->where('customer_id', $customer->id)
                    ->whereNotNull('exit_time')
                    ->latest()
                    ->paginate($limit); 
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'name'               => $user->name,
                    'email'              => $user->email,
                    'phone'              => $customer->phone_number ?? '-',
                    'plate'              => $customer->registered_plate_number ?? '-',
                    'active_transaction' => $activeTransaction,
                    'member'             => $customer->member ? [
                        'is_active'  => (bool) $customer->member->is_active,
                        'expired_at' => $customer->member->expired_at,
                    ] : null,
                    'transactions'       => $transactions
                ]
            ]);
        } catch (Exception $e) {
            // 🌟 Ini akan melempar pesan error aslinya ke console/network tab React jika masih gagal
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // 🌟 3. Fungsi Mobile Tap-In (Cari Slot via Dijkstra)
    public function mobileTapIn(Request $request)
    {
        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['message' => 'Data profil customer tidak lengkap.'], 400);
            }

            // Validasi: Pastikan tidak ada transaksi aktif (mencegah double tap-in)
            $hasActive = ParkingTransaction::where('customer_id', $customer->id)
                ->whereNull('exit_time')
                ->exists();

            if ($hasActive) {
                return response()->json(['message' => 'Anda sedang dalam sesi parkir aktif.'], 400);
            }

            // Eksekusi SSOT Dijkstra
            $optimalSlot = $this->dijkstraService->findOptimalSlot();

            if (!$optimalSlot) {
                return response()->json(['message' => 'Mohon maaf, seluruh area parkir saat ini penuh.'], 400);
            }

            // Cek status member aktif
            $isMemberActive = $customer->member && 
                              $customer->member->is_active && 
                              $customer->member->expired_at >= Carbon::now()->toDateString();

            // Simpan Transaksi
            $transaction = ParkingTransaction::create([
                'card_id'         => 'MOB-' . strtoupper(uniqid()), 
                'plate_number'    => $customer->registered_plate_number, 
                'parking_slot_id' => $optimalSlot->id,
                'customer_id'     => $customer->id,
                'entry_time'      => Carbon::now(),
                'is_member'       => $isMemberActive,
                'fee'             => null
            ]);

            // Kunci Slot & Broadcast ke Petugas
            $optimalSlot->update(['status' => 'occupied']);
            broadcast(new SlotUpdated($optimalSlot))->toOthers();

            // Ambil kandidat untuk rute polyline di HP
            $candidates = $this->dijkstraService->getAllCandidatesWithDijkstra();
            $allocatedRoute = collect($candidates)->firstWhere('id', $optimalSlot->id);

            return response()->json([
                'status' => 'success',
                'message' => 'Tap-In Berhasil! Silakan menuju slot Anda.',
                'data' => [
                    'transaction' => $transaction,
                    'allocated_slot' => $optimalSlot,
                    'route' => $allocatedRoute
                ]
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }

    // 🌟 4. Fungsi Mobile Tap-Out (Selesai Parkir)
    public function mobileTapOut(Request $request)
    {
        try {
            $user = Auth::user();
            $customer = $user->customer;

            $transaction = ParkingTransaction::where('customer_id', $customer->id)
                ->whereNull('exit_time')
                ->first();

            if (!$transaction) {
                return response()->json(['message' => 'Tidak ada sesi parkir yang aktif.'], 400);
            }

            $exitTime = Carbon::now();
            $entryTime = Carbon::parse($transaction->entry_time);
            $durationMinutes = (int) ceil($entryTime->floatDiffInMinutes($exitTime));

            $isMemberActive = $customer->member && 
                              $customer->member->is_active && 
                              $customer->member->expired_at >= Carbon::now()->toDateString();

            // Kalkulasi Biaya (Member = Rp 0, Biasa = Progresif)
            $fee = 0;
            if (!$isMemberActive) {
                $hours = ceil($durationMinutes / 60) ?: 1;
                $fee = $hours * 5000; // Asumsi tarif Rp 5.000 / jam
            }

            $transaction->update([
                'exit_time' => $exitTime,
                'duration_minutes' => $durationMinutes,
                'fee' => $fee,
                'is_member' => $isMemberActive // Update status member terakhir
            ]);

            // Bebaskan Slot & Broadcast ke Petugas
            $slot = ParkingSlot::find($transaction->parking_slot_id);
            if ($slot) {
                $slot->update(['status' => 'available']);
                broadcast(new SlotUpdated($slot))->toOthers();
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Tap-Out Berhasil! Terima kasih.',
                'data' => $transaction
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }
}