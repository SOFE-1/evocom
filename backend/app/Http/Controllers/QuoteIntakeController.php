<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuoteRequest;
use App\Services\QuoteRequestService;
use Illuminate\Http\JsonResponse;

class QuoteIntakeController extends Controller
{
    public function store(StoreQuoteRequest $request, QuoteRequestService $quotes): JsonResponse
    {
        $quote = $quotes->submit(
            $request->safe()->except(['files']),
            $request->layoutFiles(),
        );

        return response()->json([
            'data' => [
                'reference_code' => $quote->reference_code,
                'status' => $quote->status,
                'inspection_type' => $quote->inspection_type,
            ],
        ], 201);
    }
}
