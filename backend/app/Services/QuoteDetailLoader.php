<?php

namespace App\Services;

use App\Models\QuoteRequest;

class QuoteDetailLoader
{
    public function __construct(private readonly WarrantyLogicEngine $warranties) {}

    public function load(QuoteRequest $quote): QuoteRequest
    {
        $quote->load('warranty');

        if ($quote->warranty) {
            $this->warranties->refreshStatus($quote->warranty);
        }

        return $quote->load([
            'items',
            'media',
            'notes',
            'schedules.technician',
            'schedules.quoteRequest',
            'warranty',
            'statusEvents.user',
            'assignedTechnician',
        ]);
    }
}
