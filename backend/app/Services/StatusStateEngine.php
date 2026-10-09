<?php

namespace App\Services;

use App\Exceptions\InvalidStatusTransition;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StatusStateEngine
{
    /**
     * Pending and active can switch either way. Later steps follow the
     * installation workflow: quote, 70% down payment, schedule, install, warranty.
     *
     * @var array<string, list<string>>
     */
    private const TRANSITIONS = [
        QuoteRequest::PENDING => [QuoteRequest::ACTIVE, QuoteRequest::CANCELLED],
        QuoteRequest::ACTIVE => [QuoteRequest::PENDING, QuoteRequest::QUOTED, QuoteRequest::CANCELLED],
        QuoteRequest::QUOTED => [QuoteRequest::ACTIVE, QuoteRequest::AWAITING_PAYMENT, QuoteRequest::CANCELLED],
        QuoteRequest::AWAITING_PAYMENT => [QuoteRequest::QUOTED, QuoteRequest::SCHEDULED, QuoteRequest::CANCELLED],
        QuoteRequest::SCHEDULED => [QuoteRequest::IN_PROGRESS, QuoteRequest::CANCELLED],
        QuoteRequest::IN_PROGRESS => [QuoteRequest::COMPLETED, QuoteRequest::CANCELLED],
        QuoteRequest::COMPLETED => [],
        QuoteRequest::CANCELLED => [],
    ];

    public function __construct(private readonly WarrantyLogicEngine $warranties) {}

    public function transition(QuoteRequest $quote, string $to, ?User $actor = null): QuoteRequest
    {
        $from = $quote->status;

        if (! in_array($to, self::TRANSITIONS[$from] ?? [], true)) {
            throw new InvalidStatusTransition($from, $to);
        }

        $this->assertReady($quote, $to);

        return DB::transaction(function () use ($quote, $from, $to, $actor) {
            if ($to === QuoteRequest::AWAITING_PAYMENT) {
                $percent = (int) config('evocom.down_payment_percent', 70);
                $quote->down_payment_percent = $percent;
                $quote->down_payment_amount = Money::percent((string) $quote->quoted_total, $percent);
            }

            $quote->status = $to;
            $quote->save();

            $quote->statusEvents()->create([
                'from_status' => $from,
                'to_status' => $to,
                'user_id' => $actor?->id,
            ]);

            if ($to === QuoteRequest::COMPLETED) {
                $this->warranties->openFor($quote);
            }

            return $quote->refresh();
        });
    }

    private function assertReady(QuoteRequest $quote, string $to): void
    {
        if ($to === QuoteRequest::QUOTED) {
            $missing = $quote->items()->whereNull('final_unit_price')->exists();
            if ($missing || $quote->quoted_total === null) {
                throw ValidationException::withMessages([
                    'status' => 'Set a final price on every line before marking the request as quoted.',
                ]);
            }
        }

        if ($to === QuoteRequest::AWAITING_PAYMENT && $quote->quoted_total === null) {
            throw ValidationException::withMessages([
                'status' => 'A quotation total is required before asking for the down payment.',
            ]);
        }

        if ($to === QuoteRequest::SCHEDULED) {
            if ($quote->down_payment_received_at === null) {
                throw ValidationException::withMessages([
                    'status' => 'Record the down payment before scheduling installation.',
                ]);
            }

            if ($quote->installation_start_date === null || $quote->installation_end_date === null) {
                throw ValidationException::withMessages([
                    'installation_start_date' => 'Installation needs a start date and a promised completion date.',
                ]);
            }
        }
    }
}
