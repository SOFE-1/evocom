<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'slug',
    'category',
    'short_description',
    'description',
    'approx_price',
    'specifications',
    'sort_order',
    'is_active',
])]
class Product extends Model
{
    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'approx_price' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function quoteItems(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }
}
