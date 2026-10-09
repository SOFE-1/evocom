<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\InvalidStatusTransition;
use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteDetailResource;
use App\Http\Resources\QuoteSummaryResource;
use App\Models\QuoteItem;
use App\Models\QuoteRequest;
use App\Services\QuoteDetailLoader;
use App\Services\StatusStateEngine;
use App\Support\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class QuoteController extends Controller
{
    public function __construct(
        private readonly StatusStateEngine $statuses,
        private readonly QuoteDetailLoader $details,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $status = $request->query('status');

        $quotes = QuoteRequest::query()
            ->withCount('items')
            ->when(is_string($status) && $status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->get();

        $counts = QuoteRequest::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return QuoteSummaryResource::collection($quotes)->additional([
            'meta' => [
                'counts' => (object) $counts->all(),
            ],
        ]);
    }

    public function show(QuoteRequest $quote): QuoteDetailResource
    {
        return new QuoteDetailResource($this->details->load($quote));
    }

    public function updateStatus(Request $request, QuoteRequest $quote): QuoteDetailResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([
                QuoteRequest::PENDING,
                QuoteRequest::ACTIVE,
                QuoteRequest::QUOTED,
                QuoteRequest::AWAITING_PAYMENT,
                QuoteRequest::SCHEDULED,
                QuoteRequest::IN_PROGRESS,
                QuoteRequest::COMPLETED,
                QuoteRequest::CANCELLED,
            ])],
            'installation_start_date' => ['nullable', 'date'],
            'installation_end_date' => ['nullable', 'date', 'after_or_equal:installation_start_date'],
        ]);

        try {
            DB::transaction(function () use ($request, $quote, $data) {
                if (! empty($data['installation_start_date']) && ! empty($data['installation_end_date'])) {
                    $quote->installation_start_date = $data['installation_start_date'];
                    $quote->installation_end_date = $data['installation_end_date'];
                    $quote->save();
                }

                $this->statuses->transition($quote, $data['status'], $request->user());
            });
        } catch (InvalidStatusTransition $exception) {
            throw ValidationException::withMessages([
                'status' => $exception->getMessage(),
            ]);
        }

        return new QuoteDetailResource($this->details->load($quote->refresh()));
    }

    public function updatePricing(Request $request, QuoteRequest $quote): QuoteDetailResource
    {
        if (! in_array($quote->status, [QuoteRequest::ACTIVE, QuoteRequest::QUOTED], true)) {
            throw ValidationException::withMessages([
                'status' => 'Final prices can be saved while a request is active or quoted.',
            ]);
        }

        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer'],
            'items.*.final_unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            DB::transaction(function () use ($request, $quote, $data) {
                $ids = collect($data['items'])->pluck('id');
                $owned = $quote->items()->whereIn('id', $ids)->count();

                if ($owned !== $quote->items()->count() || $owned !== count($data['items'])) {
                    throw ValidationException::withMessages([
                        'items' => 'Save a final price for every line on this request.',
                    ]);
                }

                $total = '0.00';
                foreach ($data['items'] as $row) {
                    /** @var QuoteItem $item */
                    $item = $quote->items()->whereKey($row['id'])->firstOrFail();
                    $item->final_unit_price = Money::normalize($row['final_unit_price']);
                    $item->save();
                    $total = Money::add($total, Money::mul($item->final_unit_price, $item->quantity));
                }

                $quote->quoted_total = $total;
                if ($quote->down_payment_received_at === null) {
                    $quote->down_payment_amount = Money::percent(
                        $total,
                        (int) $quote->down_payment_percent,
                    );
                }
                $quote->save();

                if ($quote->status === QuoteRequest::ACTIVE) {
                    $this->statuses->transition($quote, QuoteRequest::QUOTED, $request->user());
                }
            });
        } catch (InvalidStatusTransition $exception) {
            throw ValidationException::withMessages([
                'status' => $exception->getMessage(),
            ]);
        }

        return new QuoteDetailResource($this->details->load($quote->refresh()));
    }

    public function recordPayment(Request $request, QuoteRequest $quote): QuoteDetailResource|JsonResponse
    {
        if ($quote->status !== QuoteRequest::AWAITING_PAYMENT) {
            throw ValidationException::withMessages([
                'status' => 'The down payment is recorded after the client confirms the quotation.',
            ]);
        }

        if ($quote->down_payment_received_at === null) {
            $quote->down_payment_received_at = now();
            $quote->save();
        }

        return new QuoteDetailResource($this->details->load($quote->refresh()));
    }
}
