<?php

namespace App\Http\Controllers;

use App\Mail\AdminAspirationNotificationMail;
use App\Mail\AspirationConfirmationMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AspirationNotificationController extends Controller
{
    /**
     * Kirim email notifikasi ke admin dan tanda terima ke pengirim saat aspirasi diposting.
     */
    public function notify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|max:3000',
            'category' => 'nullable|string|max:100',
            'authorName' => 'nullable|string|max:255',
            'authorNim' => 'nullable|string|max:50',
            'authorClass' => 'nullable|string|max:50',
            'authorEmail' => 'nullable|email|max:255',
        ]);

        $recipientEmail = $validated['authorEmail'] ?? Auth::user()?->email;

        try {
            // 1. Notifikasi ke admin HMIF
            Mail::to('info@hmif-lpkia.my.id')->send(new AdminAspirationNotificationMail($validated));

            // 2. Tanda terima ke mahasiswa pengirim (jika ada email terdeteksi)
            if ($recipientEmail) {
                Mail::to($recipientEmail)->send(new AspirationConfirmationMail($validated));
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal mengirim email aspirasi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Aspirasi tersimpan, namun terjadi kendala saat mengirim email notifikasi.',
            ], 200);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi email aspirasi berhasil dikirim.',
        ]);
    }
}
