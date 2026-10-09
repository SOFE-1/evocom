<?php

namespace App\Services;

use App\Models\MediaFile;
use App\Models\QuoteRequest;
use Illuminate\Http\UploadedFile;

class FileHandlingService
{
    /**
     * Store a non-ocular site layout. Images go to layout_plans and videos to site_videos.
     *
     * @param  array<int, UploadedFile>  $files
     */
    public function storeLayouts(QuoteRequest $quote, array $files): void
    {
        foreach ($files as $file) {
            $mime = (string) $file->getMimeType();
            $isVideo = str_starts_with($mime, 'video/');
            $folder = $isVideo ? 'site_videos' : 'layout_plans';
            $path = $file->store($folder, 'public');

            $quote->media()->create([
                'kind' => $isVideo ? MediaFile::SITE_VIDEO : MediaFile::LAYOUT_IMAGE,
                'disk' => 'public',
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $mime,
                'size' => $file->getSize() ?: 0,
            ]);
        }
    }
}
