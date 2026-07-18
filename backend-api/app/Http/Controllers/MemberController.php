<?php

namespace App\Http\Controllers; // Pastikan namespace sesuai dengan struktur folder kamu

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Events\MemberStatusUpdated;

class MemberController extends Controller
{
    /**
     * 1. INDEX: Menampilkan daftar Customer dengan paginasi dan fitur pencarian.
     * Menggantikan index() lama yang meload semua data tanpa batas (get).
     */
    public function index(Request $request)
        {
            $search = $request->query('search');
            $perPage = $request->query('per_page', 10);

            $customers = Customer::with(['user', 'member'])
                ->when($search, function ($query, $search) {
                    // 1. Ubah kata kunci dari React menjadi huruf kecil semua
                    $lowerSearch = strtolower($search);

                    // 2. Gunakan whereRaw dengan fungsi LOWER() pada kolom database
                    $query->whereRaw('LOWER(registered_plate_number) LIKE ?', ["%{$lowerSearch}%"])
                        ->orWhereHas('user', function ($q) use ($lowerSearch) {
                            $q->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"])
                                ->orWhereRaw('LOWER(email) LIKE ?', ["%{$lowerSearch}%"]);
                        });
                })
                ->latest()
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $customers
            ]);
        }

    /**
     * 2. SHOW: Menampilkan detail spesifik satu Customer (Profil Customer).
     * Baru ditambahkan untuk memfasilitasi admin saat klik profil pelanggan.
     */
    public function show($id)
    {
        $customer = Customer::with(['user', 'member', 'transactions' => function($query) {
            $query->latest()->limit(5); // Ambil 5 transaksi terakhir untuk preview admin
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * 3. TOGGLE MEMBERSHIP: Mengaktifkan, memperbarui, atau menonaktifkan status Member.
     * Ini MENGGANTIKAN fungsi store() dan update() lama kamu.
     */
    public function toggleMembership(Request $request, $customerId)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
            // Jika is_active true, wajib ada expired_at yang valid
            'expired_at' => 'required_if:is_active,true|nullable|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        // Pastikan customer exist
        $customer = Customer::findOrFail($customerId);

        // Gunakan updateOrCreate agar tidak duplikat. 
        // Jika belum ada data member untuk customer ini, akan di-create. Jika ada, di-update.
        $member = Member::updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'is_active'  => $request->is_active,
                // Gunakan nilai lama jika menonaktifkan, atau gunakan nilai baru jika mengaktifkan
                'expired_at' => $request->is_active ? $request->expired_at : \App\Models\Member::where('customer_id', $customer->id)->value('expired_at'),
            ]
        );

        broadcast(new MemberStatusUpdated($member));

        return response()->json([
            'success' => true,
            'message' => $request->is_active ? 'Membership berhasil diaktifkan.' : 'Membership dinonaktifkan.',
            'data'    => $member,
        ]);
    }

    /**
     * 4. DESTROY: Menghapus data member secara permanen.
     * Tetap dipertahankan dari kodemu sebelumnya jika admin benar-benar ingin menghapus baris di tabel members.
     */
    public function destroy($id)
    {
        $member = Member::findOrFail($id);
        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data member berhasil dihapus permanen.'
        ]);
    }
}