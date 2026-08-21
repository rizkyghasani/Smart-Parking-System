<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ParkingSlot;
use App\Models\ParkingTransaction;
use App\Models\SlotOverride;
use App\Models\Notification;
use App\Models\ManualVerification;
use App\Events\SlotUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\ParkingController;
use Carbon\Carbon;

class StaffController extends Controller
{
    public function dashboard()
    {
        $slots = ParkingSlot::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $activeTransactions = ParkingTransaction::whereNull('exit_time')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'slots' => [
                    'available' => $slots['available'] ?? 0,
                    'occupied'  => $slots['occupied'] ?? 0,
                    'violation' => $slots['violation'] ?? 0,
                ],
                'active_transactions_count' => $activeTransactions
            ]
        ]);
    }

    public function activeTransactions()
    {
        $transactions = ParkingTransaction::with(['slot', 'customer.user'])
            ->whereNull('exit_time')
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $transactions]);
    }

    public function manualTapOut(Request $request, $slotId)
    {
        $request->merge(['slot_id' => $slotId]);

        $parkingController = app(ParkingController::class);
        return $parkingController->tapOut($request);
    }

    public function manualTapOutByPlate(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string'
        ]);

        $transaction = ParkingTransaction::whereRaw('UPPER(plate_number) = ?', [strtoupper($request->plate_number)])
            ->whereNull('exit_time')
            ->latest()
            ->first();

        if (!$transaction) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kendaraan dengan plat tersebut tidak ditemukan atau sudah keluar.'
            ], 404);
        }

        $request->merge(['slot_id' => $transaction->parking_slot_id]);

        $parkingController = app(ParkingController::class);
        return $parkingController->tapOut($request);
    }

    public function manualVerificationTapOut(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:parking_transactions,id',
            'verified_plate' => 'required|string',
            'vehicle_model'  => 'required|string',
            'vehicle_color'  => 'required|string',
            'driver_name'    => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $transaction = ParkingTransaction::lockForUpdate()->findOrFail($request->transaction_id);

            if ($transaction->exit_time !== null) {
                DB::rollBack();
                return response()->json([
                    'success' => false, 
                    'message' => 'Transaksi ini sudah diselesaikan sebelumnya (sudah tap-out).'
                ], 400);
            }

            ManualVerification::create([
                'transaction_id' => $transaction->id,
                'staff_id'       => Auth::id(),
                'verified_plate' => strtoupper($request->verified_plate),
                'vehicle_model'  => $request->vehicle_model,
                'vehicle_color'  => $request->vehicle_color,
                'driver_name'    => $request->driver_name,
            ]);

            $transaction->update(['plate_number' => strtoupper($request->verified_plate)]);

            // 🌟 TANDAI SEMUA NOTIFIKASI TERKAIT TRANSAKSI INI MENJADI SELESAI
            Notification::where('transaction_id', $transaction->id)
                ->whereNull('resolved_by')
                ->update([
                    'read_at'     => now(),
                    'resolved_by' => Auth::id(),
                    'resolved_at' => now(),
                ]);

            DB::commit();

            $request->merge(['slot_id' => $transaction->parking_slot_id]);
            $parkingController = app(ParkingController::class);
            return $parkingController->tapOut($request);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function overrideSlot(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:parking_transactions,id',
            'new_slot_id'    => 'required|exists:parking_slots,id',
            'reason'         => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $transaction = ParkingTransaction::lockForUpdate()->findOrFail($validated['transaction_id']);
            $oldSlot = ParkingSlot::lockForUpdate()->findOrFail($transaction->parking_slot_id);
            $newSlot = ParkingSlot::lockForUpdate()->findOrFail($validated['new_slot_id']);

            if (!in_array($newSlot->status, ['available', 'violation'])) {
                return response()->json(['success' => false, 'message' => 'Slot tujuan tidak valid atau sudah terisi sah.'], 400);
            }

            SlotOverride::create([
                'transaction_id' => $transaction->id,
                'old_slot_id'    => $oldSlot->id,
                'new_slot_id'    => $newSlot->id,
                'staff_id'       => Auth::id(),
                'reason'         => $validated['reason'],
            ]);

            $transaction->update(['parking_slot_id' => $newSlot->id]);

            $oldSlot->update(['status' => 'available']);
            $newSlot->update(['status' => 'occupied']);

            broadcast(new SlotUpdated($oldSlot));
            broadcast(new SlotUpdated($newSlot));

            Notification::create([
                'type' => 'info',
                'title' => 'Slot Overriden',
                'body' => "Staff memindahkan transaksi dari {$oldSlot->slot_code} ke {$newSlot->slot_code}.",
                'from_user_id' => Auth::id(),
                'resolved_by' => Auth::id(),
                'resolved_at' => now(),
            ]);

            // 🌟 TANDAI SEMUA NOTIFIKASI TERKAIT TRANSAKSI INI MENJADI SELESAI
            Notification::where('transaction_id', $transaction->id)
                ->whereNull('resolved_by')
                ->update([
                    'read_at'     => now(),
                    'resolved_by' => Auth::id(),
                    'resolved_at' => now(),
                ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Berhasil memindahkan slot.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan sistem.'], 500);
        }
    }

    public function notifications()
    {
        $notifications = Notification::whereNull('to_user_id')
            ->orWhere('to_user_id', Auth::id())
            ->latest()
            ->limit(20)
            ->get();

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function markNotificationRead($id)
    {
        $notification = Notification::findOrFail($id);
        
        $updateData = ['read_at' => now()];

        // 🌟 PERBAIKAN: Izinkan Auto-Resolve HANYA jika notifikasi ini berupa 'info'
        // Jika tipenya 'violation' atau 'manual_tapout', tombol ini TIDAK AKAN me-resolve-nya.
        if ($notification->type === 'info') {
            $updateData['resolved_by'] = Auth::id();
            $updateData['resolved_at'] = now();
        }

        $notification->update($updateData);
        
        return response()->json(['success' => true]);
    }

    public function clearAllNotifications(Request $request)
    {
        $query = Notification::whereNull('read_at')
            ->where(function ($q) use ($request) {
                $q->whereNull('to_user_id')
                ->orWhere('to_user_id', $request->user()->id);
            });

        // 1. Resolve khusus tipe info yang nyangkut
        (clone $query)->where('type', 'info')->update([
            'read_at'     => now(),
            'resolved_by' => Auth::id(),
            'resolved_at' => now(),
        ]);

        // 2. Tandai baca sisanya (pelanggaran/tugas) TANPA me-resolve-nya
        (clone $query)->where('type', '!=', 'info')->update([
            'read_at' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }

    public function manualVerificationHistory()
    {
        $history = \App\Models\ManualVerification::with(['transaction.slot'])
            ->latest()
            ->limit(100) 
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}