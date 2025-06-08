<?php

namespace App\Http\Controllers; // Pastikan namespace benar

use App\Models\Transaksi; // Pastikan model diimport
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Untuk logging
use Illuminate\Support\Str;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap as MidtransSnap;

class TransaksiController extends Controller
{
    public function __construct()
    {
        // Konfigurasi Midtrans
        $serverKey = config('midtrans.server_key');
        $clientKey = config('midtrans.client_key');

        if (!$serverKey || !$clientKey) {
            Log::error('[TransaksiController] Midtrans ServerKey atau ClientKey tidak diset di config.');
        }

        MidtransConfig::$serverKey = $serverKey;
        MidtransConfig::$clientKey = $clientKey;
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized = config('midtrans.is_sanitized');
        MidtransConfig::$is3ds = config('midtrans.is_3ds');
    }

    public function beli(Request $request)
    {
        Log::info('[TransaksiController@beli] Request diterima:', $request->all());

        // Authentication
        if (!property_exists($request, 'auth') || $request->auth === null) {
            Log::error('[TransaksiController@beli] $request->auth tidak ditemukan atau null.');
            return response()->json(['status' => 'error', 'message' => 'Data autentikasi tidak ditemukan.'], 500);
        }
        $userAuth = $request->auth;
        Log::info('[TransaksiController@beli] Isi $request->auth:', (array) $userAuth);

        if (!property_exists($userAuth, 'sub') || $userAuth->sub === null) {
            Log::error('[TransaksiController@beli] Klaim "sub" (user_id) tidak ditemukan.');
            return response()->json(['status' => 'error', 'message' => 'User ID tidak ditemukan.'], 400);
        }
        $userId = $userAuth->sub;
        Log::info('[TransaksiController@beli] User ID: ' . $userId);

        // Validation
        $validated = $this->validate($request, [
            'mobil_id' => 'required|integer',
            'amount' => 'required|integer|min:1000',
            'customer_details' => 'sometimes|array',
            'item_details' => 'sometimes|array',
        ]);

        // Create Order ID
        $orderId = 'ORDER-' . Str::uuid()->toString();

        // Database Transaction
        $dataToCreate = [
            'order_id' => $orderId,
            'user_id' => $userId,
            'mobil_id' => $validated['mobil_id'],
            'amount' => $validated['amount'],
            'payment_status' => 'pending',
        ];
        Log::info('[TransaksiController@beli] Data untuk create transaksi:', $dataToCreate);

        $transaksi = Transaksi::create($dataToCreate);
        Log::info('[TransaksiController@beli] Transaksi dibuat di DB. Order ID: ' . $orderId);

        // Midtrans Parameters
        $customerDetails = [
            'first_name' => $userAuth->name ?? 'Pengguna',
            'email' => $userAuth->email ?? 'test.customer@example.com',
            'phone' => $userAuth->phone ?? '08123456789',
        ];
        $itemDetails = [[
            'id' => (string) $validated['mobil_id'],
            'price' => (int) $validated['amount'],
            'quantity' => 1,
            'name' => 'Pembelian Mobil ID: ' . $validated['mobil_id'],
        ]];
        
        // =================================================================
        // == PERUBAHAN UTAMA ADA DI SINI: MENAMBAHKAN 'callbacks' ========
        // =================================================================
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $transaksi->amount,
            ],
            'customer_details' => $customerDetails,
            'item_details' => $itemDetails,
            'callbacks' => [
                // URL ini adalah halaman di React App Anda yang akan dituju
                // setelah pembayaran selesai.
                'finish' => 'http://localhost:3000/transactions'
            ]
        ];
        // =================================================================

        Log::info('[TransaksiController@beli] Parameter untuk Midtrans:', $params);

        try {
            $snapToken = MidtransSnap::getSnapToken($params);
            Log::info('[TransaksiController@beli] Snap token: ' . $snapToken);

            $transaksi->snap_token = $snapToken;
            $transaksi->save();

            return response()->json([
                'status' => 'success',
                'order_id' => $orderId,
                'snap_token' => $snapToken,
                'redirect_url' => "https://app.sandbox.midtrans.com/snap/v4/redirection/{$snapToken}"
            ]);
        } catch (\Exception $e) {
            Log::error('[TransaksiController@beli] Midtrans error: ' . $e->getMessage(), ['params' => $params]);
            $transaksi->payment_status = 'failed_to_initiate_payment';
            $transaksi->payment_details = ['error_midtrans' => $e->getMessage()];
            $transaksi->save();
            return response()->json(['status' => 'error', 'message' => 'Gagal memulai pembayaran: ' . $e->getMessage()], 500);
        }
    }

    public function riwayat(Request $request)
    {
        Log::info('[TransaksiController@riwayat] Request diterima.');

        if (!property_exists($request, 'auth') || $request->auth === null) {
            Log::error('[TransaksiController@riwayat] $request->auth tidak ditemukan atau null.');
            return response()->json(['status' => 'error', 'message' => 'Data autentikasi tidak ditemukan.'], 500);
        }
        $userAuth = $request->auth;
        Log::info('[TransaksiController@riwayat] Isi $request->auth:', (array) $userAuth);

        if (!property_exists($userAuth, 'sub') || $userAuth->sub === null) {
            Log::error('[TransaksiController@riwayat] Klaim "sub" (user_id) tidak ditemukan di $request->auth atau nilainya null.');
            return response()->json(['status' => 'error', 'message' => 'User ID (sub claim) tidak ditemukan dalam token atau null.'], 400);
        }
        $userId = $userAuth->sub;
        Log::info('[TransaksiController@riwayat] User ID dari token (sub claim): ' . $userId);

        $transaksis = Transaksi::where('user_id', $userId)
                                ->orderBy('created_at', 'desc')
                                ->get();
        Log::info('[TransaksiController@riwayat] Riwayat transaksi ditemukan sejumlah: ' . $transaksis->count());

        return response()->json($transaksis);
    }

    public function handleNotification(Request $request)
    {
        Log::info('[TransaksiController@handleNotification] Notifikasi Midtrans diterima:', $request->all());
        $notif = null;
        try {
            $notif = new \Midtrans\Notification();
        } catch (\Exception $e) {
            Log::error('[TransaksiController@handleNotification] Error membuat objek MidtransNotification: ' . $e->getMessage(), $request->all());
            return response()->json(['status' => 'error', 'message' => 'Invalid notification object from Midtrans.'], 400);
        }

        if (!$notif) {
            Log::error('[TransaksiController@handleNotification] Objek notifikasi Midtrans null setelah instansiasi.');
            return response()->json(['status' => 'error', 'message' => 'Failed to process Midtrans notification object.'], 500);
        }

        $transactionStatus = $notif->transaction_status;
        $paymentType = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraudStatus = $notif->fraud_status;

        Log::info("[TransaksiController@handleNotification] Order ID: {$orderId}, Status: {$transactionStatus}, Payment Type: {$paymentType}, Fraud Status: {$fraudStatus}");

        $transaksi = Transaksi::where('order_id', $orderId)->first();

        if (!$transaksi) {
            Log::warning("[TransaksiController@handleNotification] Transaksi dengan Order ID: {$orderId} tidak ditemukan.");
            return response()->json(['status' => 'ok', 'message' => 'Notification received, but transaction not found locally. Midtrans should stop retrying.'], 200);
        }

        $currentStatus = $transaksi->payment_status;
        if (in_array($currentStatus, ['success', 'settlement', 'capture'])) {
            Log::info("[TransaksiController@handleNotification] Transaksi Order ID: {$orderId} sudah dalam status {$currentStatus}. Notifikasi diabaikan untuk mencegah duplikasi proses.");
            return response()->json(['status' => 'ok', 'message' => 'Transaction already processed. Notification acknowledged.'], 200);
        }

        $newStatus = $transaksi->payment_status;
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $newStatus = 'challenge';
            } else if ($fraudStatus == 'accept') {
                $newStatus = 'success';
            }
        } else if ($transactionStatus == 'settlement') {
            $newStatus = 'success';
        } else if ($transactionStatus == 'pending') {
            $newStatus = 'pending';
        } else if ($transactionStatus == 'deny') {
            $newStatus = 'denied';
        } else if ($transactionStatus == 'expire') {
            $newStatus = 'expired';
        } else if ($transactionStatus == 'cancel') {
            $newStatus = 'cancelled';
        } else {
            Log::warning("[TransaksiController@handleNotification] Status transaksi tidak dikenal: {$transactionStatus} untuk Order ID: {$orderId}");
        }

        $transaksi->payment_status = $newStatus;
        $transaksi->payment_type = $paymentType;
        $transaksi->payment_details = (array) $notif->getResponse();
        $transaksi->save();

        Log::info("[TransaksiController@handleNotification] Transaksi Order ID: {$orderId} berhasil diupdate menjadi {$transaksi->payment_status}.");
        
        return response()->json(['status' => 'ok', 'message' => 'Notification processed successfully by Transaksi Service.'], 200);
    }
}
