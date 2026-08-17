<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ParkingTransaction;
use Exception;

class AdminTransactionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $limitQuery = $request->query('limit', 10);
            
            // 🌟 JIKA 'all', SET LIMIT KE ANGKA SANGAT BESAR
            $limit = $limitQuery === 'all' ? 999999 : (int) $limitQuery;
            
            $search = $request->query('search', '');

            // Ambil semua transaksi beserta relasi slot dan profil customer (jika ada)
            $transactions = ParkingTransaction::with(['slot', 'customer.user'])
                ->when($search, function ($query) use ($search) {
                    // Filter pencarian berdasarkan plat nomor
                    $query->whereRaw('LOWER(plate_number) LIKE ?', ["%{$lowerSearch}%"]);
                })
                ->latest('entry_time') // Urutkan dari yang paling baru
                ->paginate($limit);

            return response()->json([
                'status' => 'success',
                'data' => $transactions
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data transaksi: ' . $e->getMessage()
            ], 500);
        }
    }
}