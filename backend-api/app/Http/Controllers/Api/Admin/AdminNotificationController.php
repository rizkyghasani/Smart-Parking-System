<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    /**
     * 1. Mengambil semua notifikasi untuk Admin (termasuk nama staf penyelesai)
     */
    public function index()
    {
        // Menggunakan join agar kamu tidak perlu repot mengubah file Model Notification.php
        $notifications = Notification::select('notifications.*', 'users.name as resolver_name')
            ->leftJoin('users', 'notifications.resolved_by', '=', 'users.id')
            ->latest('notifications.created_at')
            ->limit(100) // Batasi 100 terakhir agar memori aman
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * 2. Fungsi untuk me-retrigger (Eskalasi) notifikasi kembali ke Staff
     */
    public function retrigger($id)
    {
        $oldNotif = Notification::findOrFail($id);

        // Bersihkan title jika sebelumnya sudah pernah di-eskalasi (mencegah double tag)
        $cleanTitle = str_replace('[ESKALASI ADMIN] ', '', $oldNotif->title);

        // Kita buat notifikasi BARU (Duplikat) sebagai rekam jejak Audit Trail
        $newNotif = Notification::create([
            'type'           => $oldNotif->type,
            'title'          => '[ESKALASI ADMIN] ' . $cleanTitle,
            'body'           => $oldNotif->body,
            'to_user_id'     => null, // Broadcast ke semua staf yang sedang online
            'transaction_id' => $oldNotif->transaction_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dieskalasi kembali ke seluruh staf lapangan!',
            'data'    => $newNotif
        ]);
    }

    /**
     * 3. Menghapus notifikasi yang sudah selesai
     */
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);

        // Validasi: Tolak penghapusan jika tugas masih belum selesai (dan bukan log info)
        if ($notification->resolved_by === null && $notification->type !== 'info') {
            return response()->json([
                'success' => false,
                'message' => 'Gagal: Hanya notifikasi yang sudah selesai ditangani yang boleh dihapus.'
            ], 403);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat notifikasi berhasil dihapus permanen.'
        ]);
    }
}