<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\BalanceTopup;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Validation\Rule;

class BalanceTopupController extends Controller
{
    // Nominal minimum & maksimum per transaksi top-up (Rp).
    public const MIN_AMOUNT = 20000;
    public const MAX_AMOUNT = 2000000;

    // Metode pembayaran yang didukung (simulasi, tanpa payment gateway riil).
    public const PAYMENT_METHODS = ['virtual_account', 'qris', 'debit_card'];

    /**
     * Inisiasi top-up: validasi nominal & metode, lalu buat transaksi berstatus pending.
     */
    public function initiate(Request $request)
    {
        // Validasi di luar try agar ValidationException tetap menghasilkan 422.
        $validated = $request->validate([
            'amount'         => ['required', 'numeric', 'min:' . self::MIN_AMOUNT, 'max:' . self::MAX_AMOUNT],
            'payment_method' => ['required', Rule::in(self::PAYMENT_METHODS)],
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['message' => 'Data profil customer tidak lengkap.'], 400);
            }

            $topup = BalanceTopup::create([
                'customer_id'    => $customer->id,
                'amount'         => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'status'         => 'pending',
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Transaksi top-up berhasil dibuat. Silakan konfirmasi pembayaran.',
                'data'    => [
                    'topup'       => $topup,
                    'balance'     => $customer->balance,
                    'min_amount'  => self::MIN_AMOUNT,
                    'max_amount'  => self::MAX_AMOUNT,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Konfirmasi top-up hasil simulasi pembayaran (success/failed).
     * Idempoten: hanya transaksi berstatus pending yang dapat dikonfirmasi.
     * Pada status success, saldo akun ditambah dalam DB::transaction dengan
     * penguncian baris (lockForUpdate) untuk mencegah kondisi balapan.
     */
    public function confirm(Request $request, $id)
    {
        // Validasi di luar try agar ValidationException tetap menghasilkan 422.
        $validated = $request->validate([
            'status' => ['required', Rule::in(['success', 'failed'])],
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['message' => 'Data profil customer tidak lengkap.'], 400);
            }

            $topup = BalanceTopup::where('customer_id', $customer->id)->find($id);

            if (!$topup) {
                return response()->json(['message' => 'Transaksi top-up tidak ditemukan.'], 404);
            }

            if ($topup->status !== 'pending') {
                return response()->json([
                    'message' => 'Transaksi top-up sudah diproses sebelumnya.',
                    'data'    => ['topup' => $topup]
                ], 422);
            }

            $result = DB::transaction(function () use ($topup, $validated, $customer) {
                // Kunci baris customer agar tidak ada dua konfirmasi/kredit bersamaan.
                $lockedCustomer = Customer::whereKey($customer->id)->lockForUpdate()->first();

                $topup->update(['status' => $validated['status']]);

                if ($validated['status'] === 'success') {
                    $lockedCustomer->increment('balance', $topup->amount);
                    $newBalance = $lockedCustomer->fresh()->balance;
                } else {
                    $newBalance = $lockedCustomer->balance;
                }

                return [
                    'topup'       => $topup,
                    'balance'     => $newBalance,
                ];
            });

            $message = $validated['status'] === 'success'
                ? 'Top-up berhasil. Saldo Anda telah diperbarui.'
                : 'Pembayaran gagal. Saldo Anda tidak berubah.';

            return response()->json([
                'status'  => $validated['status'],
                'message' => $message,
                'data'    => $result,
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Riwayat transaksi top-up milik customer (paginasi).
     */
    public function history(Request $request)
    {
        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['message' => 'Data profil customer tidak lengkap.'], 400);
            }

            $limit = (int) $request->query('limit', 10);

            $history = BalanceTopup::where('customer_id', $customer->id)
                ->latest()
                ->paginate($limit);

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'balance'  => $customer->balance,
                    'history'  => $history,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Saldo terkini customer.
     */
    public function balance()
    {
        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['message' => 'Data profil customer tidak lengkap.'], 400);
            }

            return response()->json([
                'status' => 'success',
                'data'   => ['balance' => $customer->balance],
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }
}