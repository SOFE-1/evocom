<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = AdminNotification::query()
            ->with('quoteRequest')
            ->latest()
            ->limit(30)
            ->get();

        return response()->json([
            'data' => $notifications->map(fn (AdminNotification $notification) => $this->payload($notification))->values(),
            'meta' => [
                'unread_count' => AdminNotification::query()->whereNull('read_at')->count(),
            ],
        ]);
    }

    public function read(AdminNotification $notification): JsonResponse
    {
        if ($notification->read_at === null) {
            $notification->read_at = now();
            $notification->save();
        }

        return response()->json([
            'data' => $this->payload($notification),
            'meta' => [
                'unread_count' => AdminNotification::query()->whereNull('read_at')->count(),
            ],
        ]);
    }

    public function readAll(): JsonResponse
    {
        AdminNotification::query()->whereNull('read_at')->update(['read_at' => now()]);

        return $this->index();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(AdminNotification $notification): array
    {
        $quote = $notification->quoteRequest;

        return [
            'id' => $notification->id,
            'quote_request_id' => $notification->quote_request_id,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
            'customer_name' => $quote?->customer_name,
            'reference_code' => $quote?->reference_code,
            'inspection_type' => $quote?->inspection_type,
        ];
    }
}
