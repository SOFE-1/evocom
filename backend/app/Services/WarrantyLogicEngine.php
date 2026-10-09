<?php

namespace App\Services;

use App\Models\QuoteRequest;
use App\Models\Warranty;

class WarrantyLogicEngine
{
    public function openFor(QuoteRequest $quote): Warranty
    {
        $starts = now();
        $years = (int) config('evocom.warranty_years', 1);

        return Warranty::query()->updateOrCreate(
            ['quote_request_id' => $quote->id],
            [
                'starts_at' => $starts,
                'ends_at' => $starts->copy()->addYears($years),
                'status' => Warranty::ACTIVE,
            ],
        );
    }

    public function refreshStatus(Warranty $warranty): Warranty
    {
        if ($warranty->status === Warranty::ACTIVE && $warranty->ends_at->isPast()) {
            $warranty->status = Warranty::EXPIRED;
            $warranty->save();
        }

        return $warranty;
    }
}
