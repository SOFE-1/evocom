<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'reference_code',
    'customer_name',
    'customer_email',
    'customer_phone',
    'location',
    'inspection_type',
    'status',
    'message',
    'down_payment_percent',
    'approx_total',
    'quoted_total',
    'down_payment_amount',
    'down_payment_received_at',
    'installation_start_date',
    'installation_end_date',
    'assigned_technician_id',
])]
class QuoteRequest extends Model
{
    public const PENDING = 'pending';

    public const ACTIVE = 'active';

    public const QUOTED = 'quoted';

    public const AWAITING_PAYMENT = 'awaiting_payment';

    public const SCHEDULED = 'scheduled';

    public const IN_PROGRESS = 'in_progress';

    public const COMPLETED = 'completed';

    public const CANCELLED = 'cancelled';

    public const OCULAR = 'ocular';

    public const NON_OCULAR = 'non_ocular';

    protected function casts(): array
    {
        return [
            'approx_total' => 'decimal:2',
            'quoted_total' => 'decimal:2',
            'down_payment_amount' => 'decimal:2',
            'down_payment_percent' => 'integer',
            'down_payment_received_at' => 'datetime',
            'installation_start_date' => 'date',
            'installation_end_date' => 'date',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(MediaFile::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class)->orderBy('created_at');
    }

    public function warranty(): HasOne
    {
        return $this->hasOne(Warranty::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ScheduleEvent::class)->orderBy('starts_at');
    }

    public function statusEvents(): HasMany
    {
        return $this->hasMany(QuoteStatusEvent::class)->orderBy('created_at');
    }

    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(Technician::class, 'assigned_technician_id');
    }
}
