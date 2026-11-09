<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\InvalidStatusTransition;
use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteDetailResource;
use App\Http\Resources\QuoteSummaryResource;
use App\Models\QuoteCharge;
use App\Models\QuoteItem;
use App\Models\QuoteRequest;
use App\Support\QuotationDocument;
use App\Services\QuoteDetailLoader;
use App\Services\StatusStateEngine;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;
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
            ->withSum('items as items_count', 'quantity')
            ->withCount('payments')
            ->withSum('payments as amount_paid_sum', 'amount')
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
            'installation_start_date' => ['nullable', 'date', 'after_or_equal:today'],
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
            'items' => ['present', 'array'],
            'items.*.id' => ['required', 'integer'],
            'items.*.final_unit_price' => ['required', 'numeric', 'min:0'],
            'charges' => ['nullable', 'array'],
            'charges.*.category' => ['required', 'string', Rule::in(QuoteCharge::CATEGORIES)],
            'charges.*.description' => ['required', 'string', 'max:200'],
            'charges.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'charges.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'charges.*.finalized' => ['required', 'boolean'],
        ]);

        try {
            DB::transaction(function () use ($request, $quote, $data) {
                $ids = collect($data['items'])->pluck('id');
                $owned = $ids->isEmpty() ? 0 : $quote->items()->whereIn('id', $ids)->count();

                if ($owned !== $quote->items()->count() || $owned !== count($data['items'])) {
                    throw ValidationException::withMessages([
                        'items' => 'Save a final price for every camera on this request.',
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

                $quote->charges()->delete();
                $finalized = false;
                foreach ($data['charges'] ?? [] as $row) {
                    $isFinal = (bool) $row['finalized'];
                    if ($isFinal && ($row['unit_price'] === null || $row['unit_price'] === '')) {
                        throw ValidationException::withMessages([
                            'charges' => 'Enter a price for every labor or material line included in the total.',
                        ]);
                    }

                    $price = $row['unit_price'] === null || $row['unit_price'] === ''
                        ? null
                        : Money::normalize($row['unit_price']);
                    $quote->charges()->create([
                        'category' => $row['category'],
                        'description' => $row['description'],
                        'quantity' => $row['quantity'],
                        'unit_price' => $price,
                        'finalized' => $isFinal,
                    ]);

                    if ($isFinal && $price !== null) {
                        $finalized = true;
                        $total = Money::add($total, Money::mul($price, $row['quantity']));
                    }
                }

                $hasCameras = count($data['items']) > 0;
                if (! $hasCameras && ! $finalized && ($data['charges'] ?? []) === []) {
                    throw ValidationException::withMessages([
                        'charges' => 'Add installation labor or materials before saving this quotation. Camera lines are optional.',
                    ]);
                }

                if ($quote->status === QuoteRequest::QUOTED && ! $hasCameras && ! $finalized) {
                    throw ValidationException::withMessages([
                        'charges' => 'Keep at least one finalized price on a quotation that was already saved.',
                    ]);
                }

                if ($hasCameras || $finalized) {
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
                } else {
                    $quote->save();
                }
            });
        } catch (InvalidStatusTransition $exception) {
            throw ValidationException::withMessages([
                'status' => $exception->getMessage(),
            ]);
        }

        return new QuoteDetailResource($this->details->load($quote->refresh()));
    }

    public function pdf(QuoteRequest $quote): Response
    {
        if ($quote->quoted_total === null || in_array($quote->status, [QuoteRequest::PENDING, QuoteRequest::ACTIVE], true)) {
            throw ValidationException::withMessages([
                'quote' => 'Save a finalized quotation before downloading it.',
            ]);
        }

        $filename = $quote->reference_code.'.pdf';

        return response(QuotationDocument::render($quote), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

}
