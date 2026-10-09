<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteDetailResource;
use App\Models\QuoteRequest;
use App\Services\QuoteDetailLoader;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function store(Request $request, QuoteRequest $quote, QuoteDetailLoader $details): QuoteDetailResource
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $quote->notes()->create([
            'user_id' => $request->user()->id,
            'author_name' => $request->user()->name,
            'body' => $data['body'],
        ]);

        return new QuoteDetailResource($details->load($quote));
    }
}
