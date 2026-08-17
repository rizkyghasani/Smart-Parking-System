<?php

namespace App\Http\Controllers; 

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Events\MemberStatusUpdated;
use Carbon\Carbon; // 🌟 Wajib ditambahkan untuk manipulasi dan komparasi tanggal

class MemberController extends Controller
{
    /**
     * 1. INDEX: Menampilkan daftar Customer dengan paginasi dan fitur pencarian.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $customers = Customer::with(['user', 'member'])
            ->when($search, function ($query, $search) {
                $lowerSearch = strtolower($search);

                $query->whereRaw('LOWER(registered_plate_number) LIKE ?', ["%{$lowerSearch}%"])
                    ->orWhereHas('user', function ($q) use ($lowerSearch) {
                        $q->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"])
                            ->orWhereRaw('LOWER(email) LIKE ?', ["%{$lowerSearch}%"]);
                    });
            })
            ->latest()
            ->paginate($perPage);

        // 🌟 LAZY UPDATE: Periksa dan matikan status member yang sudah kadaluarsa
        $customers->getCollection()->transform(function ($customer) {
            if ($customer->member && $customer->member->is_active) {
                // Ambil batas akhir hari tersebut (23:59:59)
                $expiredDate = Carbon::parse($customer->member->expired_at)->endOfDay();
                
                if ($expiredDate->isPast()) {
                    // 1. Update database secara otomatis
                    $customer->member->update(['is_active' => false]);
                    
                    // 2. Update objek di memori agar response JSON langsung merender "false"
                    $customer->member->is_active = false;
                }
            }
            return $customer;
        });

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * 2. SHOW: Menampilkan detail spesifik satu Customer (Profil Customer).
     */
    public function show($id)
    {
        $customer = Customer::with(['user', 'member', 'transactions' => function($query) {
            $query->latest()->limit(5); 
        }])->findOrFail($id);

        // 🌟 LAZY UPDATE: Lakukan pengecekan yang sama saat membuka detail spesifik
        if ($customer->member && $customer->member->is_active) {
            $expiredDate = Carbon::parse($customer->member->expired_at)->endOfDay();
            
            if ($expiredDate->isPast()) {
                $customer->member->update(['is_active' => false]);
                $customer->member->is_active = false;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * 3. TOGGLE MEMBERSHIP: Mengaktifkan, memperbarui, atau menonaktifkan status Member.
     */
    public function toggleMembership(Request $request, $customerId)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
            'expired_at' => 'required_if:is_active,true|nullable|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $customer = Customer::findOrFail($customerId);

        $member = Member::updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'is_active'  => $request->is_active,
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