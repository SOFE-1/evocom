<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quote_request_id',
    'amount',
    'paid_on',
    'method',
    'remarks',
    'recorded_by',
])]
class Payment extends Model
{
    public const METHODS = [
        'Cash',
        'Bank transfer',
        'GCash',
        'Maya',
        'Cheque',
        'Credit card',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_on' => 'date',
        ];
    }

    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
