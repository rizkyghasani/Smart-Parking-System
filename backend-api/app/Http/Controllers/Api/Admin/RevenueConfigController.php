<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RevenueConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RevenueConfigController extends Controller
{
    /**
     * 📋 Mengambil Semua Riwayat Tarif (Termasuk Data Admin)
     * GET /api/admin/revenue-config
     */
    public function index()
    {
        // Tarik semua data riwayat, urutkan dari yang paling baru berlaku
        $history = RevenueConfig::with('creator:id,name,email')
            ->orderBy('effective_from', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat tarif berhasil diambil',
            'data' => $history
        ], 200);
    }

    public function getLatest()
    {
        $latestConfig = RevenueConfig::with('creator:id,name,email')
            ->orderBy('effective_from', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Data tarif terbaru berhasil diambil',
            'data' => $latestConfig
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rate_per_hour' => 'required|integer|min:0',
            'effective_from' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $config = RevenueConfig::create([
            'rate_per_hour' => $request->rate_per_hour,
            'effective_from' => $request->effective_from,
            'created_by' => (string) $request->user()->id,
        ]);

        // Muat relasi creator sebelum dikembalikan ke frontend
        $config->load('creator:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Tarif baru berhasil diterapkan',
            'data' => $config
        ], 201);
    }
}