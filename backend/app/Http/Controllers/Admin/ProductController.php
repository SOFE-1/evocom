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
            'brand' => ['required', 'string', 'max:80'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'short_description' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:5000'],
            'approx_price' => ['required', 'numeric', 'min:0'],
            'price_max' => ['required', 'numeric', 'min:0', 'gte:approx_price'],
            'specifications' => ['nullable', 'array'],
            'specifications.*' => ['string', 'max:200'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['required', 'boolean'],
        ], [
            'price_max.gte' => 'The high price must be at least the low price.',
        ]);

        $slug = Str::slug($data['name']);
        if ($slug === '') {
            throw ValidationException::withMessages([
                'name' => 'Use a name that can become a catalog link.',
            ]);
        }

        $product = [
            'name' => $data['name'],
            'category' => $data['category'],
            'brand' => $data['brand'],
            'short_description' => $data['short_description'],
            'description' => $data['description'],
            'approx_price' => $data['approx_price'],
            'price_max' => $data['price_max'],
            'specifications' => $data['specifications'] ?? [],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'],
        ];

        if ($request->hasFile('image')) {
            $stored = $request->file('image')->store('products', 'public');
            $product['image_path'] = '/storage/'.$stored;
        } elseif ($request->exists('image_path')) {
            $product['image_path'] = $data['image_path'] ?? null;
        }

        return $product;
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
