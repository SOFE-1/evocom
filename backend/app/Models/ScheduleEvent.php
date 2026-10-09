<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quote_request_id',
    'technician_id',
    'event_type',
    'starts_at',
    'ends_at',
    'notes',
])]
class ScheduleEvent extends Model
{
    protected $table = 'schedules';

    public const OCULAR = 'ocular';

    public const INSTALLATION = 'installation';

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(Technician::class);
    }
}
