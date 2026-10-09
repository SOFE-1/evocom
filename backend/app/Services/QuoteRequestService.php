<?php

namespace App\Services;

use App\Models\Product;
use App\Models\QuoteRequest;
use App\Support\Money;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QuoteRequestService
{
    public function __construct(private readonly FileHandlingService $files) {}

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, UploadedFile>  $uploads
     */
    public function submit(array $data, array $uploads = []): QuoteRequest
    {
        $lines = $this->lines($data['items'] ?? null);

        return DB::transaction(function () use ($data, $uploads, $lines) {
            $productIds = collect($lines)->pluck('product_id')->unique()->all();
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->where('is_active', true)
                ->get()
                ->keyBy('id');

            $quote = QuoteRequest::query()->create([
                'reference_code' => 'EVO-TMP-'.Str::ulid(),
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'location' => $data['location'],
                'inspection_type' => $data['inspection_type'],
                'status' => QuoteRequest::PENDING,
                'message' => $data['message'] ?? null,
                'down_payment_percent' => (int) config('evocom.down_payment_percent', 70),
                'approx_total' => 0,
            ]);

            $quote->reference_code = sprintf('EVO-%s-%04d', now()->format('Ymd'), $quote->id);

            $total = '0.00';
            foreach ($lines as $line) {
                $product = $products->get($line['product_id']);
                if ($product === null) {
                    throw ValidationException::withMessages([
                        'items' => 'One or more products are no longer available.',
                    ]);
                }

                $lineTotal = Money::mul($product->approx_price, $line['quantity']);
                $total = Money::add($total, $lineTotal);

                $quote->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $line['quantity'],
                    'approx_unit_price' => $product->approx_price,
                ]);
            }

            $quote->approx_total = $total;
            $quote->save();

            $quote->statusEvents()->create([
                'from_status' => null,
                'to_status' => QuoteRequest::PENDING,
                'user_id' => null,
            ]);

            if ($quote->inspection_type === QuoteRequest::NON_OCULAR) {
                $this->files->storeLayouts($quote, $uploads);
            }

            return $quote->load(['items', 'media']);
        });
    }

    /**
     * @return list<array{product_id: int, quantity: int}>
     */
    private function lines(mixed $raw): array
    {
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

        if (! is_array($decoded) || $decoded === []) {
            throw ValidationException::withMessages([
                'items' => 'Add at least one product to the quote list.',
            ]);
        }

        $lines = [];
        foreach ($decoded as $line) {
            if (! is_array($line) || ! isset($line['product_id'], $line['quantity'])) {
                throw ValidationException::withMessages([
                    'items' => 'Each quote line needs a product and a quantity.',
                ]);
            }

            $quantity = (int) $line['quantity'];
            if ($quantity < 1 || $quantity > 99) {
                throw ValidationException::withMessages([
                    'items' => 'Quantity must be between 1 and 99.',
                ]);
            }

            $lines[] = [
                'product_id' => (int) $line['product_id'],
                'quantity' => $quantity,
            ];
        }

        return $lines;
    }
}
