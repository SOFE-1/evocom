<?php

namespace Tests\Feature;

use App\Mail\QuoteReceivedMail;
use App\Models\AdminNotification;
use App\Models\MediaFile;
use App\Models\Product;
use App\Models\QuoteRequest;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
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

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [
            'amount' => 5600,
            'paid_on' => now()->toDateString(),
            'method' => 'Cash',
            'remarks' => '70% down payment',
        ])->assertOk()
            ->assertJsonPath('data.status', QuoteRequest::AWAITING_PAYMENT)
            ->assertJsonPath('data.payment_status', 'partial')
            ->assertJsonPath('data.amount_paid', '5600.00')
            ->assertJsonPath('data.balance_remaining', '2400.00');

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::SCHEDULED,
            'installation_start_date' => now()->addDay()->toDateString(),
            'installation_end_date' => now()->addDays(3)->toDateString(),
        ])->assertOk()->assertJsonPath('data.status', QuoteRequest::SCHEDULED);

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::IN_PROGRESS,
        ])->assertOk();

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::COMPLETED,
        ])->assertStatus(422);

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [
            'amount' => 2400,
            'paid_on' => now()->toDateString(),
            'method' => 'Cash',
            'remarks' => 'Balance',
        ])->assertOk()->assertJsonPath('data.payment_status', 'paid');

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

    public function test_installation_inquiry_without_products_is_stored(): void
    {
        $this->post('/api/quotes', [
            'customer_name' => 'Site Owner',
            'customer_email' => 'owner@example.com',
            'customer_phone' => '09171234567',
            'location' => 'Montalban, Rizal',
            'inspection_type' => 'ocular',
            'message' => 'Need installation for the gate and parking.',
            'items' => '[]',
            ...$this->publicGuard(),
        ], [
            'Accept' => 'application/json',
        ])->assertCreated();

        $quote = QuoteRequest::query()->first();
        $this->assertNotNull($quote);
        $this->assertSame('0.00', $quote->approx_total);
        $this->assertSame(0, $quote->items()->count());
        $this->assertSame('pending', $quote->paymentSnapshot()['payment_status']);
    }

    public function test_payments_move_from_pending_to_partial_to_paid(): void
    {
        $product = $this->product(['approx_price' => 1000]);
        $admin = User::factory()->create();

        $this->post('/api/quotes', $this->payload($product, 'ocular', 1), [
            'Accept' => 'application/json',
        ])->assertCreated();

        $quote = QuoteRequest::query()->firstOrFail();
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [])
            ->assertStatus(422);

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [
            'amount' => 400,
            'paid_on' => now()->toDateString(),
            'method' => 'GCash',
            'remarks' => 'Before a quotation exists',
        ])->assertStatus(422);

        $quote->refresh();
        $this->assertNull($quote->quoted_total);
        $this->assertNull($quote->down_payment_received_at);
        $this->assertSame('pending', $quote->paymentSnapshot()['payment_status']);

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::ACTIVE,
        ])->assertOk();

        $item = $quote->items()->firstOrFail();
        $this->putJson("/api/admin/quotes/{$quote->id}/pricing", [
            'items' => [
                ['id' => $item->id, 'final_unit_price' => 1000],
            ],
            'charges' => [],
        ])->assertOk()->assertJsonPath('data.quoted_total', '1000.00');

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [
            'amount' => 400,
            'paid_on' => now()->toDateString(),
            'method' => 'GCash',
            'remarks' => 'First installment',
        ])->assertOk()
            ->assertJsonPath('data.payment_status', 'partial')
            ->assertJsonPath('data.balance_remaining', '600.00')
            ->assertJsonPath('data.payments.0.client_name', 'Site Owner')
            ->assertJsonPath('data.payments.0.status', 'partial');

        $quote->refresh();
        $this->assertNull($quote->down_payment_received_at);

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [
            'amount' => 600,
            'paid_on' => now()->toDateString(),
            'method' => 'Bank transfer',
            'remarks' => 'Balance',
        ])->assertOk()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.balance_remaining', '0.00')
            ->assertJsonPath('data.payments.1.status', 'paid')
            ->assertJsonCount(2, 'data.payments');

        $this->assertNotNull($quote->refresh()->down_payment_received_at);

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [
            'amount' => 1,
            'paid_on' => now()->toDateString(),
            'method' => 'Cash',
        ])->assertStatus(422);

        $this->getJson('/api/admin/payments?group=pending')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->getJson('/api/admin/payments?group=active')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.reference_code', $quote->reference_code);
    }

    public function test_a_workflow_flag_does_not_mark_the_balance_paid(): void
    {
        $product = $this->product();
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->post('/api/quotes', $this->payload($product, 'ocular'), [
            'Accept' => 'application/json',
        ])->assertCreated();

        $quote = QuoteRequest::query()->firstOrFail();
        $quote->quoted_total = '4500.00';
        $quote->down_payment_received_at = now();
        $quote->save();

        $this->getJson("/api/admin/quotes/{$quote->id}")
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('data.amount_paid', '0.00')
            ->assertJsonCount(0, 'data.payments');
    }

    public function test_camera_quantity_is_the_sum_of_units(): void
    {
        $product = $this->product();
        $admin = User::factory()->create();

        $this->post('/api/quotes', $this->payload($product, 'ocular', 3), [
            'Accept' => 'application/json',
        ])->assertCreated();

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/quotes')
            ->assertOk()
            ->assertJsonPath('data.0.items_count', 3);
    }

    public function test_installation_only_request_can_be_quoted_with_labor(): void
    {
        $admin = User::factory()->create();

        $this->post('/api/quotes', [
            'customer_name' => 'Site Owner',
            'customer_email' => 'owner@example.com',
            'customer_phone' => '09171234567',
            'location' => 'Montalban, Rizal',
            'inspection_type' => 'ocular',
            'message' => 'Installation only.',
            'items' => '[]',
            ...$this->publicGuard(),
        ], [
            'Accept' => 'application/json',
        ])->assertCreated();

        $quote = QuoteRequest::query()->firstOrFail();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::ACTIVE,
        ])->assertOk();

        $this->putJson("/api/admin/quotes/{$quote->id}/pricing", [
            'items' => [],
            'charges' => [
                [
                    'category' => 'Installation labor',
                    'description' => 'Gate and parking',
                    'quantity' => 1,
                    'unit_price' => 3500,
                    'finalized' => true,
                ],
                [
                    'category' => 'Cabling',
                    'description' => 'Length to be measured on site',
                    'quantity' => 1,
                    'unit_price' => null,
                    'finalized' => false,
                ],
            ],
        ])->assertOk()
            ->assertJsonPath('data.status', QuoteRequest::QUOTED)
            ->assertJsonPath('data.quoted_total', '3500.00')
            ->assertJsonPath('data.charges.1.finalized', false);
    }

    public function test_cancelled_request_cannot_take_a_payment(): void
    {
        $product = $this->product();
        $admin = User::factory()->create();
        $this->post('/api/quotes', $this->payload($product, 'ocular'), [
            'Accept' => 'application/json',
        ])->assertCreated();
        $quote = QuoteRequest::query()->firstOrFail();
        $quote->status = QuoteRequest::QUOTED;
        $quote->quoted_total = '1000.00';
        $quote->save();

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/quotes/{$quote->id}/status", [
            'status' => QuoteRequest::CANCELLED,
        ])->assertOk();

        $this->postJson("/api/admin/quotes/{$quote->id}/payments", [
            'amount' => 100,
            'paid_on' => now()->toDateString(),
            'method' => 'Cash',
        ])->assertStatus(422);
    }

    public function test_visits_reject_past_dates_and_overlapping_technicians_and_can_be_cancelled(): void
    {
        $product = $this->product(['slug' => 'schedule-camera']);
        $admin = User::factory()->create();
        $technician = Technician::query()->create([
            'name' => 'Install crew',
            'is_active' => true,
        ]);

        $this->post('/api/quotes', $this->payload($product, 'ocular'), [
            'Accept' => 'application/json',
        ])->assertCreated();
        $quote = QuoteRequest::query()->firstOrFail();
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/quotes/{$quote->id}/schedules", [
            'technician_id' => $technician->id,
            'event_type' => 'ocular',
            'starts_at' => '2020-01-01 09:00:00',
            'ends_at' => '2020-01-01 10:00:00',
        ])->assertStatus(422);

        $start = now()->addDay()->setTime(9, 0)->format('Y-m-d H:i:s');
        $end = now()->addDay()->setTime(11, 0)->format('Y-m-d H:i:s');

        $this->postJson("/api/admin/quotes/{$quote->id}/schedules", [
            'technician_id' => $technician->id,
            'event_type' => 'ocular',
            'starts_at' => $start,
            'ends_at' => $end,
        ])->assertOk();

        $this->postJson("/api/admin/quotes/{$quote->id}/schedules", [
            'technician_id' => $technician->id,
            'event_type' => 'installation',
            'starts_at' => now()->addDay()->setTime(10, 0)->format('Y-m-d H:i:s'),
            'ends_at' => now()->addDay()->setTime(12, 0)->format('Y-m-d H:i:s'),
        ])->assertStatus(422);

        $visitId = $quote->schedules()->firstOrFail()->id;
        $this->deleteJson("/api/admin/schedules/{$visitId}")->assertOk();

        $this->assertNotNull($quote->schedules()->firstOrFail()->cancelled_at);

        $this->postJson("/api/admin/quotes/{$quote->id}/schedules", [
            'technician_id' => $technician->id,
            'event_type' => 'ocular',
            'starts_at' => $start,
            'ends_at' => $end,
        ])->assertOk();
    }

    public function test_tracking_requires_the_customer_email_and_hides_notes(): void
    {
        Mail::fake();
        $product = $this->product(['slug' => 'track-camera']);

        $created = $this->post('/api/quotes', $this->payload($product, 'ocular'), [
            'Accept' => 'application/json',
        ])->assertCreated();

        Mail::assertSent(QuoteReceivedMail::class);
        $this->assertSame(1, AdminNotification::query()->count());

        $reference = $created->json('data.reference_code');

        $this->postJson('/api/quotes/track', [
            'reference_code' => $reference,
            'email' => 'other@example.com',
            ...$this->publicGuard(),
        ])->assertStatus(422);

        $this->postJson('/api/quotes/track', [
            'reference_code' => $reference,
            'email' => 'owner@example.com',
            ...$this->publicGuard(),
        ])->assertOk()
            ->assertJsonPath('data.reference_code', $reference)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.quotation_ready', false)
            ->assertJsonMissingPath('data.message')
            ->assertJsonMissingPath('data.notes');
    }

    public function test_guests_and_non_admins_cannot_open_quote_requests(): void
    {
        $this->getJson('/api/admin/quotes')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['role' => User::ROLE_TECHNICIAN]));

        $this->getJson('/api/admin/quotes')->assertForbidden();
    }

    public function test_a_filled_honeypot_does_not_create_a_quote(): void
    {
        $product = $this->product(['slug' => 'honeypot-camera']);

        $this->post('/api/quotes', [
            ...$this->payload($product, 'ocular'),
            ...$this->publicGuard(['company_website' => 'https://spam.example']),
        ], [
            'Accept' => 'application/json',
        ])->assertStatus(422)
            ->assertJsonPath('errors.company_website.0', 'The request could not be sent.');

        $this->assertSame(0, QuoteRequest::query()->count());
    }

    public function test_a_filled_honeypot_does_not_look_up_a_request(): void
    {
        $product = $this->product(['slug' => 'honeypot-track']);
        $created = $this->post('/api/quotes', $this->payload($product, 'ocular'), [
            'Accept' => 'application/json',
        ])->assertCreated();

        $this->postJson('/api/quotes/track', [
            'reference_code' => $created->json('data.reference_code'),
            'email' => 'owner@example.com',
            ...$this->publicGuard(['company_website' => 'https://spam.example']),
        ])->assertStatus(422)
            ->assertJsonPath('errors.company_website.0', 'The request could not be sent.')
            ->assertJsonMissingPath('data.reference_code');
    }

    public function test_a_fast_quote_post_is_rejected(): void
    {
        $product = $this->product(['slug' => 'fast-quote']);

        $this->post('/api/quotes', [
            ...$this->payload($product, 'ocular'),
            ...$this->publicGuard(['form_loaded_at' => now()->getTimestamp()]),
        ], [
            'Accept' => 'application/json',
        ])->assertStatus(422)
            ->assertJsonPath('errors.form_loaded_at.0', 'Please wait a moment and send the form again.');

        $this->assertSame(0, QuoteRequest::query()->count());
    }

    public function test_a_fast_track_post_is_rejected(): void
    {
        $product = $this->product(['slug' => 'fast-track']);
        $created = $this->post('/api/quotes', $this->payload($product, 'ocular'), [
            'Accept' => 'application/json',
        ])->assertCreated();

        $this->postJson('/api/quotes/track', [
            'reference_code' => $created->json('data.reference_code'),
            'email' => 'owner@example.com',
            ...$this->publicGuard(['form_loaded_at' => now()->getTimestamp()]),
        ])->assertStatus(422)
            ->assertJsonPath('errors.form_loaded_at.0', 'Please wait a moment and send the form again.')
            ->assertJsonMissingPath('data.reference_code');
    }

    public function test_the_same_quote_details_reuse_the_existing_reference(): void
    {
        Mail::fake();
        $product = $this->product(['slug' => 'duplicate-camera']);
        $payload = $this->payload($product, 'ocular');

        $first = $this->post('/api/quotes', $payload, [
            'Accept' => 'application/json',
        ])->assertCreated();

        $second = $this->post('/api/quotes', $payload, [
            'Accept' => 'application/json',
        ])->assertCreated();

        $this->assertSame($first->json('data.reference_code'), $second->json('data.reference_code'));
        $this->assertSame(1, QuoteRequest::query()->count());
        $this->assertSame(1, AdminNotification::query()->count());
        Mail::assertSent(QuoteReceivedMail::class, 1);
    }

    public function test_admin_can_set_a_product_price_range(): void
    {
        $admin = User::factory()->create();
        $product = $this->product(['slug' => 'priced-camera', 'approx_price' => 0, 'price_max' => 0]);
        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/products/{$product->id}", [
            'name' => $product->name,
            'category' => $product->category,
            'brand' => $product->brand ?: 'Evocom',
            'short_description' => $product->short_description,
            'description' => $product->description,
            'approx_price' => 4000,
            'price_max' => 11000,
            'is_active' => true,
            'specifications' => ['Resolution' => '4MP'],
            'sort_order' => 1,
        ])->assertOk()
            ->assertJsonPath('data.approx_price', '4000.00')
            ->assertJsonPath('data.price_max', '11000.00');

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonPath('data.0.approx_price', '4000.00')
            ->assertJsonPath('data.0.price_max', '11000.00');
    }

    public function test_price_max_cannot_be_below_the_from_price(): void
    {
        $admin = User::factory()->create();
        $product = $this->product(['slug' => 'range-camera']);
        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/products/{$product->id}", [
            'name' => $product->name,
            'category' => $product->category,
            'brand' => $product->brand ?: 'Evocom',
            'short_description' => $product->short_description,
            'description' => $product->description,
            'approx_price' => 8000,
            'price_max' => 1000,
            'is_active' => true,
        ])->assertStatus(422);
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
            ...$this->publicGuard(),
        ];
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function publicGuard(array $overrides = []): array
    {
        return [
            'form_loaded_at' => now()->subSeconds(10)->getTimestamp(),
            'company_website' => '',
            ...$overrides,
        ];
    }
}
