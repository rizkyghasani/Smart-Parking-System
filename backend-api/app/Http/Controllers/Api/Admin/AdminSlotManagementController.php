<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminSlotManagementController extends Controller
{
    /**
     * 📥 Ambil Semua Slot
     * GET /api/admin/slots
     */
    public function index()
    {
        $slots = ParkingSlot::orderBy('priority_weight', 'asc')
            ->orderBy('slot_code', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $slots
        ], 200);
    }

    /**
     * ➕ Tambah Slot Baru
     * POST /api/admin/slots
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'slot_code' => 'required|string|max:20|unique:parking_slots,slot_code',
            'priority_weight' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $slot = ParkingSlot::create([
            'slot_code' => strtoupper($request->slot_code),
            'priority_weight' => $request->priority_weight,
            'status' => 'available'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot berhasil dibuat',
            'data' => $slot
        ], 201);
    }

    /**
     * ✏️ Update Slot
     * PUT /api/admin/slots/{id}
     */
    public function update(Request $request, $id)
    {
        $slot = ParkingSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'slot_code' => 'required|string|max:20|unique:parking_slots,slot_code,' . $id,
            'priority_weight' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $slot->update([
            'slot_code' => strtoupper($request->slot_code),
            'priority_weight' => $request->priority_weight,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot berhasil diperbarui',
            'data' => $slot
        ], 200);
    }

    /**
     * 🗑️ Hapus Slot
     * DELETE /api/admin/slots/{id}
     */
    public function destroy($id)
    {
        $slot = ParkingSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot tidak ditemukan'
            ], 404);
        }

        // Safety Check:
        // Jangan izinkan menghapus slot yang sedang terisi
        if ($slot->status === 'occupied') {
            return response()->json([
                'success' => false,
                'message' => 'Slot sedang terisi kendaraan dan tidak dapat dihapus'
            ], 400);
        }

        $slot->delete();

        return response()->json([
            'success' => true,
            'message' => 'Slot berhasil dihapus'
        ], 200);
    }

    /**
     * ⚡ Ubah Status Slot
     * PATCH /api/admin/slots/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:available,occupied,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Status tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        $slot = ParkingSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot tidak ditemukan'
            ], 404);
        }

        $slot->status = $request->status;
        $slot->save();

        return response()->json([
            'success' => true,
            'message' => "Status slot {$slot->slot_code} berhasil diperbarui",
            'data' => $slot
        ], 200);
    }
}