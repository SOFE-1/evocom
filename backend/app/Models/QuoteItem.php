<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quote_request_id',
    'product_id',
    'product_name',
    'quantity',
    'approx_unit_price',
    'final_unit_price',
])]
class QuoteItem extends Model
{
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'approx_unit_price' => 'decimal:2',
            'final_unit_price' => 'decimal:2',
        ];
    }

    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
