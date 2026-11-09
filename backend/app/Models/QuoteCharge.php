<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quote_request_id',
    'category',
    'description',
    'quantity',
    'unit_price',
    'finalized',
])]
class QuoteCharge extends Model
{
    public const CATEGORIES = [
        'Installation labor',
        'Cabling',
        'DVR/NVR',
        'Hard drive',
        'Connectors and accessories',
        'Other materials',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'finalized' => 'boolean',
        ];
    }

    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }
}
