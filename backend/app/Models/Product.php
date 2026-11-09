<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'slug',
    'category',
    'brand',
    'image_path',
    'short_description',
    'description',
    'approx_price',
    'price_max',
    'specifications',
    'sort_order',
    'is_active',
])]
class Product extends Model
{
    public const TYPES = [
        'Bullet Camera',
        'PTZ Camera',
        'Dome Camera',
        'Turret Camera',
        'Multi-Sensor Camera',
    ];

    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'approx_price' => 'decimal:2',
            'price_max' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function quoteItems(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    /**
     * @return array{min: string, max: string}
     */
    public static function placeholderRange(string $category): array
    {
        return match ($category) {
            'PTZ Camera' => ['min' => '12000.00', 'max' => '45000.00'],
            'Multi-Sensor Camera' => ['min' => '15000.00', 'max' => '55000.00'],
            default => ['min' => '3500.00', 'max' => '12000.00'],
        };
    }

    /**
     * @param  array<string, mixed>  $product
     * @return array<string, mixed>
     */
    public static function withPlaceholderPrices(array $product): array
    {
        $range = self::placeholderRange((string) ($product['category'] ?? ''));
        $min = isset($product['approx_price']) && (float) $product['approx_price'] > 0
            ? $product['approx_price']
            : $range['min'];
        $max = isset($product['price_max']) && (float) $product['price_max'] > 0
            ? $product['price_max']
            : $range['max'];
        if ((float) $max < (float) $min) {
            $max = $min;
        }

        $product['approx_price'] = $min;
        $product['price_max'] = $max;

        return $product;
    }
}
