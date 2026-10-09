<?php

namespace App\Http\Resources;

use App\Models\ScheduleEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ScheduleEvent */
class ScheduleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quote_request_id' => $this->quote_request_id,
            'reference_code' => $this->quoteRequest?->reference_code,
            'customer_name' => $this->quoteRequest?->customer_name,
            'location' => $this->quoteRequest?->location,
            'technician_id' => $this->technician_id,
            'technician_name' => $this->technician?->name,
            'event_type' => $this->event_type,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'notes' => $this->notes,
        ];
    }
}
