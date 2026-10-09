<?php

namespace App\Http\Resources;

use App\Models\QuoteItem;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin QuoteItem */
class QuoteItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'quantity' => $this->quantity,
            'approx_unit_price' => $this->approx_unit_price,
            'final_unit_price' => $this->final_unit_price,
            'line_approx' => Money::mul($this->approx_unit_price, $this->quantity),
            'line_final' => $this->final_unit_price === null
                ? null
                : Money::mul($this->final_unit_price, $this->quantity),
        ];
    }
}
