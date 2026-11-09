<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteDetailResource;
use App\Http\Resources\QuoteSummaryResource;
use App\Models\Payment;
use App\Models\QuoteRequest;
use App\Services\PaymentRecorder;
use App\Services\QuoteDetailLoader;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $group = $request->query('group');
        if (! in_array($group, ['pending', 'active'], true)) {
            $group = 'pending';
        }

        $quotes = QuoteRequest::query()
            ->with('payments')
            ->withSum('items as items_count', 'quantity')
            ->where('status', '!=', QuoteRequest::CANCELLED)
            ->latest()
            ->get();

        $pending = $quotes
            ->filter(fn (QuoteRequest $quote) => $quote->paymentSnapshot()['payment_status'] !== 'paid')
            ->values();
        $active = $quotes
            ->filter(fn (QuoteRequest $quote) => $quote->payments->isNotEmpty())
            ->values();

        return QuoteSummaryResource::collection($group === 'active' ? $active : $pending)->additional([
            'meta' => [
                'group' => $group,
                'counts' => [
                    'pending' => $pending->count(),
                    'active' => $active->count(),
                ],
            ],
        ]);
    }

    public function store(
        Request $request,
        QuoteRequest $quote,
        PaymentRecorder $recorder,
        QuoteDetailLoader $details,
    ): QuoteDetailResource {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:99999999'],
            'paid_on' => ['required', 'date', 'before_or_equal:today'],
            'method' => ['required', 'string', Rule::in(Payment::METHODS)],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $recorder->record($quote, $data, $request->user());

        return new QuoteDetailResource($details->load($quote->refresh()));
    }
}
