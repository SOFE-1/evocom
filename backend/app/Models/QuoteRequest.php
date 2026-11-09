<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Support\Money;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'reference_code',
    'customer_name',
    'customer_email',
    'customer_phone',
    'location',
    'inspection_type',
    'status',
    'message',
    'down_payment_percent',
    'approx_total',
    'quoted_total',
    'down_payment_amount',
    'down_payment_received_at',
    'installation_start_date',
    'installation_end_date',
    'assigned_technician_id',
])]
class QuoteRequest extends Model
{
    public const PENDING = 'pending';

    public const ACTIVE = 'active';

    public const QUOTED = 'quoted';

    public const AWAITING_PAYMENT = 'awaiting_payment';

    public const SCHEDULED = 'scheduled';

    public const IN_PROGRESS = 'in_progress';

    public const COMPLETED = 'completed';

    public const CANCELLED = 'cancelled';

    public const OCULAR = 'ocular';

    public const NON_OCULAR = 'non_ocular';

    protected function casts(): array
    {
        return [
            'approx_total' => 'decimal:2',
            'quoted_total' => 'decimal:2',
            'down_payment_amount' => 'decimal:2',
            'down_payment_percent' => 'integer',
            'down_payment_received_at' => 'datetime',
            'installation_start_date' => 'date',
            'installation_end_date' => 'date',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function charges(): HasMany
    {
        return $this->hasMany(QuoteCharge::class);
    }

    public function notification(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(AdminNotification::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Payment status follows recorded money only. A quotation with no payment
     * rows stays pending even if an older workflow flag was set.
     *
     * @return array{
     *     payment_status: string,
     *     amount_paid: string,
     *     amount_due: string|null,
     *     balance_remaining: string|null,
     *     payments_count: int,
     *     latest_payment_on: string|null
     * }
     */
    public function paymentSnapshot(): array
    {
        [$count, $paid, $latest] = $this->paymentTotals();
        $due = $this->amountDue();

        $status = 'pending';
        if ($count > 0) {
            $status = $due !== null && Money::compare($paid, $due) >= 0 ? 'paid' : 'partial';
        }

        $balance = null;
        if ($due !== null) {
            $raw = Money::sub($due, $paid);
            $balance = Money::compare($raw, '0') < 0 ? '0.00' : $raw;
        }

        return [
            'payment_status' => $status,
            'amount_paid' => $paid,
            'amount_due' => $due,
            'balance_remaining' => $balance,
            'payments_count' => $count,
            'latest_payment_on' => $latest,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function paymentRecords(): array
    {
        $this->loadMissing('payments');
        $due = $this->amountDue();
        $running = '0.00';
        $rows = [];
        $ordered = $this->payments->sortBy(fn (Payment $payment) => sprintf(
            '%s-%010d',
            $payment->paid_on?->toDateString() ?? '0000-00-00',
            $payment->id,
        ))->values();

        foreach ($ordered as $payment) {
            $running = Money::add($running, (string) $payment->amount);
            $status = 'partial';
            if ($due !== null && Money::compare($running, $due) >= 0) {
                $status = 'paid';
            }

            $rows[] = [
                'id' => $payment->id,
                'client_name' => $this->customer_name,
                'reference_code' => $this->reference_code,
                'amount' => Money::normalize((string) $payment->amount),
                'paid_on' => $payment->paid_on?->toDateString(),
                'method' => $payment->method,
                'status' => $status,
                'remarks' => $payment->remarks,
            ];
        }

        return $rows;
    }

    private function amountDue(): ?string
    {
        if ($this->quoted_total === null) {
            return null;
        }

        $due = Money::normalize((string) $this->quoted_total);

        return Money::compare($due, '0') > 0 ? $due : null;
    }

    /**
     * @return array{0: int, 1: string, 2: string|null}
     */
    private function paymentTotals(): array
    {
        if ($this->relationLoaded('payments')) {
            $paid = '0.00';
            $latest = null;
            foreach ($this->payments as $payment) {
                $paid = Money::add($paid, (string) $payment->amount);
                $day = $payment->paid_on?->toDateString();
                if ($day !== null && ($latest === null || $day > $latest)) {
                    $latest = $day;
                }
            }

            return [$this->payments->count(), $paid, $latest];
        }

        if (array_key_exists('payments_count', $this->attributes) && array_key_exists('amount_paid_sum', $this->attributes)) {
            return [
                (int) $this->payments_count,
                Money::normalize((string) ($this->amount_paid_sum ?? '0')),
                null,
            ];
        }

        $payments = $this->payments()->get();
        $this->setRelation('payments', $payments);
        $paid = '0.00';
        $latest = null;
        foreach ($payments as $payment) {
            $paid = Money::add($paid, (string) $payment->amount);
            $day = $payment->paid_on?->toDateString();
            if ($day !== null && ($latest === null || $day > $latest)) {
                $latest = $day;
            }
        }

        return [$payments->count(), $paid, $latest];
    }

    public function media(): HasMany
    {
        return $this->hasMany(MediaFile::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class)->orderBy('created_at');
    }

    public function warranty(): HasOne
    {
        return $this->hasOne(Warranty::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ScheduleEvent::class)->orderBy('starts_at');
    }

    public function statusEvents(): HasMany
    {
        return $this->hasMany(QuoteStatusEvent::class)->orderBy('created_at');
    }

    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(Technician::class, 'assigned_technician_id');
    }
}
