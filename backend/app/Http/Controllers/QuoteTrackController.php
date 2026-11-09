<?php

namespace App\Http\Controllers;

use App\Models\QuoteRequest;
use App\Models\ScheduleEvent;
use App\Support\PublicFormGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class QuoteTrackController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $validator = Validator::make(
            $request->all(),
            [
                'reference_code' => ['required', 'string', 'max:40'],
                'email' => ['required', 'email', 'max:160'],
                ...PublicFormGuard::rules(),
            ],
            PublicFormGuard::messages(),
        );
        $validator->after(PublicFormGuard::after(...));
        $data = $validator->validate();

        $quote = QuoteRequest::query()
            ->where('reference_code', $data['reference_code'])
            ->whereRaw('lower(customer_email) = ?', [mb_strtolower($data['email'])])
            ->first();

        if ($quote === null) {
            throw ValidationException::withMessages([
                'reference_code' => 'No request matches that reference number and email.',
            ]);
        }

        $quoted = $quote->quoted_total !== null
            && ! in_array($quote->status, [QuoteRequest::PENDING, QuoteRequest::ACTIVE], true);
        $visits = $quote->schedules()
            ->whereNull('cancelled_at')
            ->orderBy('starts_at')
            ->get()
            ->map(fn (ScheduleEvent $event) => [
                'event_type' => $event->event_type,
                'starts_at' => $event->starts_at?->toIso8601String(),
                'ends_at' => $event->ends_at?->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'data' => [
                'reference_code' => $quote->reference_code,
                'status' => $quote->status,
                'quotation_ready' => $quoted,
                'quoted_total' => $quoted ? $quote->quoted_total : null,
                'payment_status' => $quoted ? $quote->paymentSnapshot()['payment_status'] : null,
                'balance_remaining' => $quoted ? $quote->paymentSnapshot()['balance_remaining'] : null,
                'installation_start_date' => $quote->status === QuoteRequest::CANCELLED
                    ? null
                    : $quote->installation_start_date?->toDateString(),
                'installation_end_date' => $quote->status === QuoteRequest::CANCELLED
                    ? null
                    : $quote->installation_end_date?->toDateString(),
                'visits' => $visits,
            ],
        ]);
    }
}
