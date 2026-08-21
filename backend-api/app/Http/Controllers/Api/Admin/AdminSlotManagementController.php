<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use App\Models\Node;
use App\Models\Edge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminSlotManagementController extends Controller
{
    /**
     * 📥 Ambil Semua Slot
     * GET /api/admin/slots
     */
    public function index()
    {
        // Diperbarui: Diurutkan berdasarkan slot_code karena priority_weight sudah dihapus
        $slots = ParkingSlot::orderBy('slot_code', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $slots
        ], 200);
    }

    /**
     * ➕ Tambah Slot Baru (Otomatis buat Node & Edge)
     * POST /api/admin/slots
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'slot_code' => 'required|string|max:20|unique:parking_slots,slot_code',
            'x_coord'   => 'required|numeric',
            'y_coord'   => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        return DB::transaction(function () use ($request) {
            // 1. Buat data master slot
            $slot = ParkingSlot::create([
                'slot_code' => strtoupper($request->slot_code),
                'x_coord'   => $request->x_coord,
                'y_coord'   => $request->y_coord,
                'status'    => 'available'
            ]);

            // 2. Buat Node referensi graf untuk slot ini
            $newNode = Node::create([
                'name'            => 'NODE_' . strtoupper($request->slot_code),
                'type'            => 'slot',
                'x'               => $request->x_coord,
                'y'               => $request->y_coord,
                'parking_slot_id' => $slot->id,
            ]);

            // 3. Auto-Connect: Cari node terdekat untuk membentuk Edge secara otomatis
            $existingNodes = Node::where('id', '!=', $newNode->id)->get();

            if ($existingNodes->isNotEmpty()) {
                $closestNode = null;
                $minDistance = INF;

                foreach ($existingNodes as $node) {
                    $distance = sqrt(
                        pow($newNode->x - $node->x, 2) + 
                        pow($newNode->y - $node->y, 2)
                    );

                    if ($distance < $minDistance) {
                        $minDistance = $distance;
                        $closestNode = $node;
                    }
                }

                // Jika node terdekat berada dalam radius wajar (<= 6 meter), hubungkan 2 arah
                if ($closestNode && $minDistance <= 6.0) {
                    Edge::create([
                        'source_node_id' => $newNode->id,
                        'target_node_id' => $closestNode->id,
                        'weight'         => round($minDistance, 2),
                        'description'    => 'Otomatis terhubung ke ' . $closestNode->name
                    ]);

                    Edge::create([
                        'source_node_id' => $closestNode->id,
                        'target_node_id' => $newNode->id,
                        'weight'         => round($minDistance, 2),
                        'description'    => 'Otomatis terhubung ke ' . $newNode->name
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Slot, titik node, dan jalur graf berhasil dibuat',
                'data'    => $slot
            ], 201);
        });
    }

    /**
     * ✏️ Update Slot & Koordinat
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
            'x_coord'   => 'required|numeric',
            'y_coord'   => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        return DB::transaction(function () use ($request, $slot) {
            $slot->update([
                'slot_code' => strtoupper($request->slot_code),
                'x_coord'   => $request->x_coord,
                'y_coord'   => $request->y_coord,
            ]);

            // Sinkronisasi koordinat pada tabel nodes yang terikat
            if ($slot->node) {
                $slot->node->update([
                    'name' => 'NODE_' . strtoupper($request->slot_code),
                    'x'    => $request->x_coord,
                    'y'    => $request->y_coord,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Slot berhasil diperbarui',
                'data'    => $slot
            ], 200);
        });
    }

    /**
     * 🗑️ Hapus Slot (Node & Edge ikut terhapus via Cascade)
     * DELETE /api/admin/slots/{id}
     */
    public function destroy($id)
    {
        try {
            // 🌟 Pastikan meload relasi node/graf (Sesuaikan kata 'node' dengan nama fungsi relasi di model ParkingSlot-mu)
            $slot = \App\Models\ParkingSlot::with('node')->findOrFail($id);

            // 🛡️ Keamanan: Cegah hapus jika slot sedang ada mobilnya
            if ($slot->status === 'occupied') {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal: Slot ini sedang digunakan oleh kendaraan!'
                ], 400);
            }

            // 🌟 1. HAPUS NODE TERLEBIH DAHULU
            // Ini akan menghapus titik graf secara fisik agar tidak nyangkut di Algoritma Dijkstra
            if ($slot->node) {
                $slot->node->delete(); 
            }

            // 🌟 2. SOFT DELETE SLOT
            // Menyembunyikan slot dari aplikasi tanpa merusak riwayat transaksi lama
            $slot->delete();

            return response()->json([
                'success' => true,
                'message' => 'Slot beserta titik graf berhasil dihapus dari sistem.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat menghapus: ' . $e->getMessage()
            ], 500);
        }
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
            'data'    => $slot
        ], 200);
    }

    /**
     * 🚪 Tambah Pintu Exit Baru & Auto-Connect ke Graf
     * POST /api/admin/exits
     */
    public function storeExit(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:50|unique:nodes,name',
            'x_coord' => 'required|numeric',
            'y_coord' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Buat Titik Node Khusus Pintu Exit
            $exitNode = Node::create([
                'name'            => strtoupper($request->name),
                'type'            => 'exit',
                'x'               => $request->x_coord,
                'y'               => $request->y_coord,
                'parking_slot_id' => null, // Wajib null sesuai skema
            ]);

            // 2. Auto-Connect: Cari slot parkir terdekat di database
            $slots = Node::where('type', 'slot')->get();
            $closestSlot = null;
            $minDistance = INF;

            foreach ($slots as $slot) {
                // Rumus jarak Euclidean
                $distance = sqrt(
                    pow($exitNode->x - $slot->x, 2) + 
                    pow($exitNode->y - $slot->y, 2)
                );

                if ($distance < $minDistance) {
                    $minDistance = $distance;
                    $closestSlot = $slot;
                }
            }

            // 3. Jika ada slot, hubungkan gerbang ini ke slot tersebut dengan jalan 2 arah
            if ($closestSlot) {
                Edge::create([
                    'source_node_id' => $exitNode->id,
                    'target_node_id' => $closestSlot->id,
                    'weight'         => round($minDistance, 2),
                    'description'    => 'Jalur utama dari ' . $exitNode->name
                ]);

                Edge::create([
                    'source_node_id' => $closestSlot->id,
                    'target_node_id' => $exitNode->id,
                    'weight'         => round($minDistance, 2),
                    'description'    => 'Jalur keluar menuju ' . $exitNode->name
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pintu Exit berhasil ditambahkan dan dihubungkan ke ' . ($closestSlot ? $closestSlot->name : 'sistem'),
                'data'    => $exitNode
            ], 201);
        });
    }

    
}