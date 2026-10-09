<?php

namespace Tests\Feature;

use App\Models\MediaFile;
use App\Models\Product;
use App\Models\QuoteRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuoteWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_hides_inactive_products(): void
    {
        $this->product(['name' => 'Visible Camera', 'slug' => 'visible-camera', 'is_active' => true]);
        $this->product(['name' => 'Hidden Camera', 'slug' => 'hidden-camera', 'is_active' => false]);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'visible-camera');
    }

    public function test_non_ocular_request_requires_a_layout_file(): void
    {
        $product = $this->product();

        $this->post('/api/quotes', $this->payload($product, 'non_ocular'), [
            'Accept' => 'application/json',
        ])->assertStatus(422);
    }

    public function test_non_ocular_request_stores_the_layout_with_the_quote(): void
    {
        Storage::fake('public');
        $product = $this->product();

        $this->post('/api/quotes', [
            ...$this->payload($product, 'non_ocular'),
            'files' => [UploadedFile::fake()->image('layout.jpg')],
        ], [
            'Accept' => 'application/json',
        ])->assertCreated();

        $media = MediaFile::query()->first();
        $this->assertNotNull($media);
        $this->assertSame(MediaFile::LAYOUT_IMAGE, $media->kind);
        Storage::disk('public')->assertExists($media->path);
    }

    public function test_quote_moves_from_pending_to_a_one_year_warranty(): void
    {
        $product = $this->product(['approx_price' => 4500]);
        $admin = User::factory()->create();

        $created = $this->post('/api/quotes', $this->payload($product, 'ocular', 2), [
            'Accept' => 'application/json',
        ])->assertCreated();

        $reference = $created->json('data.reference_code');
        $this->assertMatchesRegularExpression('/^EVO-\d{8}-\d{4}$/', $reference);

        $quote = QuoteRequest::query()->where('reference_code', $reference)->firstOrFail();
        $this->assertSame('9000.00', $quote->approx_total);
        $this->assertSame(QuoteRequest::PENDING, $quote->status);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => 'completed',
        ])->assertStatus(422);

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::ACTIVE,
        ])->assertOk()->assertJsonPath('data.status', QuoteRequest::ACTIVE);

        $item = $quote->items()->firstOrFail();

        $this->putJson("/api/admin/quotes/{$quote->id}/pricing", [
            'items' => [
                ['id' => $item->id, 'final_unit_price' => 4000],
            ],
        ])->assertOk()
            ->assertJsonPath('data.status', QuoteRequest::QUOTED)
            ->assertJsonPath('data.quoted_total', '8000.00');

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::AWAITING_PAYMENT,
        ])->assertOk()->assertJsonPath('data.down_payment_amount', '5600.00');

        $this->postJson("/api/admin/quotes/{$quote->id}/payment")
            ->assertOk()
            ->assertJsonPath('data.status', QuoteRequest::AWAITING_PAYMENT);

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::SCHEDULED,
            'installation_start_date' => '2026-11-02',
            'installation_end_date' => '2026-11-04',
        ])->assertOk()->assertJsonPath('data.status', QuoteRequest::SCHEDULED);

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::IN_PROGRESS,
        ])->assertOk();

        $completed = $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::COMPLETED,
        ])->assertOk()->assertJsonPath('data.warranty.status', 'active');

        $starts = $completed->json('data.warranty.starts_at');
        $ends = $completed->json('data.warranty.ends_at');
        $this->assertSame(
            now()->parse($starts)->addYear()->toDateString(),
            now()->parse($ends)->toDateString(),
        );
    }

    public function test_guests_and_non_admins_cannot_open_quote_requests(): void
    {
        $this->getJson('/api/admin/quotes')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['role' => User::ROLE_TECHNICIAN]));

        $this->getJson('/api/admin/quotes')->assertForbidden();
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function product(array $overrides = []): Product
    {
        return Product::query()->create([
            'name' => 'Outdoor Bullet Camera',
            'slug' => 'outdoor-bullet-camera',
            'category' => 'Camera',
            'short_description' => 'Perimeter camera',
            'description' => 'Weather-sealed bullet camera.',
            'approx_price' => 4500,
            'specifications' => ['Resolution' => '4MP'],
            'sort_order' => 1,
            'is_active' => true,
            ...$overrides,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Product $product, string $inspection, int $quantity = 1): array
    {
        return [
            'customer_name' => 'Site Owner',
            'customer_email' => 'owner@example.com',
            'customer_phone' => '09171234567',
            'location' => 'Montalban, Rizal',
            'inspection_type' => $inspection,
            'message' => 'Gate and parking coverage.',
            'items' => json_encode([
                ['product_id' => $product->id, 'quantity' => $quantity],
            ]),
        ];
    }
}
