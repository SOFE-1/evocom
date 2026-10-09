<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Database\Seeder;

class EvocomSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@evocom.local'],
            [
                'name' => 'EVOCOM Admin',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ],
        );

        Technician::query()->updateOrCreate(
            ['name' => 'Lead ocular technician'],
            [
                'phone' => '09170000001',
                'specialty' => 'Ocular inspection and camera placement',
                'is_active' => true,
            ],
        );

        Technician::query()->updateOrCreate(
            ['name' => 'Installation technician'],
            [
                'phone' => '09170000002',
                'specialty' => 'CCTV installation and commissioning',
                'is_active' => true,
            ],
        );

        Product::query()->whereIn('slug', [
            '360-ip-camera',
            'outdoor-bullet-camera',
            'hd-dome-camera',
        ])->update(['is_active' => false]);

        $products = [
            [
                'name' => 'EvoShield Dome 4K',
                'slug' => 'evoshield-dome-4k',
                'category' => 'Dome',
                'short_description' => 'Indoor / Outdoor Vandal-Proof Dome',
                'description' => 'A vandal-resistant dome for entrances, shops, and covered outdoor areas. The final price is confirmed in the quotation after the site is reviewed.',
                'approx_price' => 8500,
                'sort_order' => 1,
                'specifications' => [
                    'Badge' => 'Best Seller',
                    'Resolution' => '4K Ultra HD (8MP)',
                    'Lens' => '2.8mm–12mm Motorised',
                    'Night Vision' => 'IR up to 40m',
                ],
            ],
            [
                'name' => 'EvoGuard Bullet Pro',
                'slug' => 'evoguard-bullet-pro',
                'category' => 'Bullet',
                'short_description' => 'Long-Range Outdoor Bullet Camera',
                'description' => 'A weather-sealed bullet for gates, parking, and perimeter lines. Supplier pricing is confirmed when the quotation is prepared.',
                'approx_price' => 7200,
                'sort_order' => 2,
                'specifications' => [
                    'Badge' => 'Popular',
                    'Resolution' => '5MP Full Colour',
                    'Lens' => '6mm Fixed',
                    'Night Vision' => 'Colour Night Vision 60m',
                ],
            ],
            [
                'name' => 'EvoPan 360 PTZ',
                'slug' => 'evopan-360-ptz',
                'category' => 'PTZ',
                'short_description' => 'Pan-Tilt-Zoom with Auto-Tracking',
                'description' => 'A PTZ camera for yards and open sites that need one head to follow movement across a wide area.',
                'approx_price' => 18500,
                'sort_order' => 3,
                'specifications' => [
                    'Badge' => 'Pro Grade',
                    'Resolution' => '4K 30fps',
                    'Zoom' => '25× Optical Zoom',
                    'Pan / Tilt' => '360° Pan · 90° Tilt',
                ],
            ],
            [
                'name' => 'EvoSlim Mini Dome',
                'slug' => 'evoslim-mini-dome',
                'category' => 'Dome',
                'short_description' => 'Discreet Indoor Ceiling Dome',
                'description' => 'A compact ceiling dome for offices, hallways, and counters where the camera should stay unobtrusive.',
                'approx_price' => 3900,
                'sort_order' => 4,
                'specifications' => [
                    'Resolution' => '2MP Full HD 1080p',
                    'Lens' => '2.8mm Fixed',
                    'Night Vision' => 'IR up to 20m',
                ],
            ],
            [
                'name' => 'EvoWatch Turret 5MP',
                'slug' => 'evowatch-turret-5mp',
                'category' => 'Turret',
                'short_description' => 'Versatile Fixed Turret Camera',
                'description' => 'A turret camera that is easy to aim after installation, for eaves, driveways, and indoor corners.',
                'approx_price' => 5400,
                'sort_order' => 5,
                'specifications' => [
                    'Resolution' => '5MP Super HD',
                    'Lens' => '2.8mm / 4mm Option',
                    'Night Vision' => 'Dual IR + Colour 30m',
                ],
            ],
            [
                'name' => 'EvoArray 360 Multi',
                'slug' => 'evoarray-360-multi',
                'category' => 'Multi-Sensor',
                'short_description' => '360° Multi-Sensor Panoramic Camera',
                'description' => 'Four sensors in one housing for junctions, warehouses, and open floors that need panoramic coverage from a single mount.',
                'approx_price' => 24000,
                'sort_order' => 6,
                'specifications' => [
                    'Badge' => 'New',
                    'Resolution' => '4 × 5MP (20MP total)',
                    'Coverage' => '360° Panoramic',
                    'Night Vision' => 'IR up to 50m per sensor',
                ],
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                [...$product, 'is_active' => true],
            );
        }
    }
}
