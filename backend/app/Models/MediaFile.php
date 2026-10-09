<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'quote_request_id',
    'kind',
    'disk',
    'path',
    'original_name',
    'mime_type',
    'size',
])]
class MediaFile extends Model
{
    public const LAYOUT_IMAGE = 'layout_image';

    public const SITE_VIDEO = 'site_video';

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }

    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
