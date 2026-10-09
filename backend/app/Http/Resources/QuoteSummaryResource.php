<?php

namespace App\Http\Resources;

use App\Models\QuoteRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin QuoteRequest */
class QuoteSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_code' => $this->reference_code,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'location' => $this->location,
            'inspection_type' => $this->inspection_type,
            'status' => $this->status,
            'items_count' => $this->items_count ?? $this->items->count(),
            'approx_total' => $this->approx_total,
            'quoted_total' => $this->quoted_total,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
