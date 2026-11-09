<?php

namespace App\Services;

use App\Models\QuoteRequest;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentRecorder
{
    /**
     * @param  array{amount: mixed, paid_on: string, method: string, remarks?: string|null}  $data
     */
    public function record(QuoteRequest $quote, array $data, ?User $actor): QuoteRequest
    {
        return DB::transaction(function () use ($quote, $data, $actor) {
            /** @var QuoteRequest $quote */
            $quote = QuoteRequest::query()->lockForUpdate()->findOrFail($quote->id);

            if ($quote->status === QuoteRequest::CANCELLED) {
                throw ValidationException::withMessages([
                    'amount' => 'Cancelled requests cannot take payments.',
                ]);
            }

            $payable = [
                QuoteRequest::QUOTED,
                QuoteRequest::AWAITING_PAYMENT,
                QuoteRequest::SCHEDULED,
                QuoteRequest::IN_PROGRESS,
                QuoteRequest::COMPLETED,
            ];

            if (! in_array($quote->status, $payable, true) || $quote->quoted_total === null) {
                throw ValidationException::withMessages([
                    'amount' => 'Save a finalized quotation before recording a payment.',
                ]);
            }

            if (Money::compare((string) $quote->quoted_total, '0') <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'The quotation total must be greater than zero.',
                ]);
            }

            $quote->load('payments');
            $remaining = $quote->paymentSnapshot()['balance_remaining'] ?? '0.00';

            if (Money::compare($remaining, '0') <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'This quotation is already fully paid.',
                ]);
            }

            $amount = Money::normalize($data['amount']);
            if (Money::compare($amount, $remaining) > 0) {
                throw ValidationException::withMessages([
                    'amount' => 'The payment cannot exceed the remaining balance of PHP '.$remaining.'.',
                ]);
            }

            if ($quote->down_payment_amount === null) {
                $quote->down_payment_amount = Money::percent(
                    (string) $quote->quoted_total,
                    (int) $quote->down_payment_percent,
                );
                $quote->save();
            }

            $quote->payments()->create([
                'amount' => $amount,
                'paid_on' => $data['paid_on'],
                'method' => $data['method'],
                'remarks' => $data['remarks'] ?? null,
                'recorded_by' => $actor?->id,
            ]);

            $quote->unsetRelation('payments');
            $quote->load('payments');
            $this->syncDownPayment($quote, $data['paid_on']);

            return $quote->refresh();
        });
    }

    public function syncDownPayment(QuoteRequest $quote, ?string $paidOn = null): void
    {
        if ($quote->quoted_total === null) {
            return;
        }

        $percent = (int) $quote->down_payment_percent;
        $down = Money::percent((string) $quote->quoted_total, $percent);
        $quote->down_payment_amount = $down;

        $paid = $quote->relationLoaded('payments')
            ? $this->sumLoaded($quote)
            : Money::normalize((string) $quote->payments()->sum('amount'));

        $covered = Money::compare($paid, '0') > 0 && Money::compare($paid, $down) >= 0;

        if ($covered && $quote->down_payment_received_at === null) {
            $quote->down_payment_received_at = $paidOn ? now()->parse($paidOn)->startOfDay() : now();
        }

        $quote->save();
    }

    private function sumLoaded(QuoteRequest $quote): string
    {
        $total = '0.00';
        foreach ($quote->payments as $payment) {
            $total = Money::add($total, Money::normalize((string) $payment->amount));
        }

        return $total;
    }
}
