<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $products = Product::query()->orderBy('sort_order')->orderBy('name')->get();

        return ProductResource::collection($products);
    }

    public function store(Request $request): ProductResource
    {
        $data = $this->validated($request);

        $product = Product::query()->create([
            ...$data,
            'slug' => $this->uniqueSlug($data['name']),
        ]);

        return new ProductResource($product);
    }

    public function update(Request $request, Product $product): ProductResource
    {
        $product->fill($this->validated($request));
        $product->save();

        return new ProductResource($product);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'category' => ['required', 'string', 'max:80'],
            'short_description' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:5000'],
            'approx_price' => ['required', 'numeric', 'min:0'],
            'specifications' => ['nullable', 'array'],
            'specifications.*' => ['string', 'max:200'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['required', 'boolean'],
        ]);

        $slug = Str::slug($data['name']);
        if ($slug === '') {
            throw ValidationException::withMessages([
                'name' => 'Use a name that can become a catalog link.',
            ]);
        }

        return [
            'name' => $data['name'],
            'category' => $data['category'],
            'short_description' => $data['short_description'],
            'description' => $data['description'],
            'approx_price' => $data['approx_price'],
            'specifications' => $data['specifications'] ?? [],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'],
        ];
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (Product::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
