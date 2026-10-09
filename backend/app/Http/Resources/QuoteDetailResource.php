<?php

namespace App\Http\Resources;

use App\Models\QuoteRequest;
use App\Models\QuoteStatusEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin QuoteRequest */
class QuoteDetailResource extends JsonResource
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
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'location' => $this->location,
            'inspection_type' => $this->inspection_type,
            'status' => $this->status,
            'message' => $this->message,
            'items_count' => $this->items->count(),
            'approx_total' => $this->approx_total,
            'quoted_total' => $this->quoted_total,
            'down_payment_percent' => $this->down_payment_percent,
            'down_payment_amount' => $this->down_payment_amount,
            'down_payment_received_at' => $this->down_payment_received_at?->toIso8601String(),
            'installation_start_date' => $this->installation_start_date?->toDateString(),
            'installation_end_date' => $this->installation_end_date?->toDateString(),
            'assigned_technician_id' => $this->assigned_technician_id,
            'assigned_technician_name' => $this->assignedTechnician?->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'items' => QuoteItemResource::collection($this->items),
            'media' => MediaFileResource::collection($this->media),
            'notes' => NoteResource::collection($this->notes),
            'schedules' => ScheduleResource::collection($this->schedules),
            'warranty' => $this->warranty ? new WarrantyResource($this->warranty) : null,
            'status_events' => $this->statusEvents->map(fn (QuoteStatusEvent $event) => [
                'id' => $event->id,
                'from_status' => $event->from_status,
                'to_status' => $event->to_status,
                'actor_name' => $event->user?->name ?? ($event->from_status === null ? 'Website' : 'Staff'),
                'created_at' => $event->created_at?->toIso8601String(),
            ])->values(),
        ];
    }
}
