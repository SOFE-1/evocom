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
        $admin = User::query()->firstOrNew(['email' => 'admin@evocom.local']);
        $admin->name = 'Evocom Admin';
        $admin->role = User::ROLE_ADMIN;
        $admin->email_verified_at = $admin->email_verified_at ?? now();
        if (! $admin->exists) {
            $admin->password = (string) env('EVOCOM_ADMIN_PASSWORD', bin2hex(random_bytes(12)));
        }
        $admin->save();

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
                'category' => 'Dome Camera',
                'brand' => 'Evocom',
                'image_path' => '/media/products/dome-camera.jpg',
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
                'category' => 'Bullet Camera',
                'brand' => 'Evocom',
                'image_path' => '/media/products/bullet-camera.jpg',
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
                'category' => 'PTZ Camera',
                'brand' => 'Evocom',
                'image_path' => '/media/products/ptz-camera.jpg',
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
                'category' => 'Dome Camera',
                'brand' => 'Evocom',
                'image_path' => '/media/products/mini-dome.jpg',
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
                'category' => 'Turret Camera',
                'brand' => 'Evocom',
                'image_path' => '/media/products/turret-camera.jpg',
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
                'category' => 'Multi-Sensor Camera',
                'brand' => 'Evocom',
                'image_path' => '/media/products/multi-sensor.jpg',
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
            [
                'name' => 'DS-2CD2047G2-LU',
                'slug' => 'hikvision-ds-2cd2047g2-lu',
                'category' => 'Bullet Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-bullet.svg',
                'short_description' => '4 MP ColorVu fixed bullet',
                'description' => 'Hikvision ColorVu bullet for gates and perimeters. Published specs: 4 MP (2688 × 1520), F1.0 lens in 2.8, 4, or 6 mm, 130 dB WDR, white light up to 40 m, built-in microphone on the -U model, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 10,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 / 4 / 6 mm, F1.0',
                    'Night Vision' => 'ColorVu white light up to 40 m',
                ],
            ],
            [
                'name' => 'DS-2CD2147G2-LSU',
                'slug' => 'hikvision-ds-2cd2147g2-lsu',
                'category' => 'Dome Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-dome.svg',
                'short_description' => '4 MP ColorVu fixed dome',
                'description' => 'Hikvision ColorVu dome for entrances and covered outdoor areas. Published specs: 4 MP (2688 × 1520), 2.8 or 4 mm F1.0 lens, 130 dB WDR, white light up to 30 m, IP67 and IK10. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 11,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 or 4 mm, F1.0',
                    'Night Vision' => 'ColorVu white light up to 30 m',
                ],
            ],
            [
                'name' => 'DS-2CD2347G2-LU',
                'slug' => 'hikvision-ds-2cd2347g2-lu',
                'category' => 'Turret Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-turret.svg',
                'short_description' => '4 MP ColorVu turret',
                'description' => 'Hikvision ColorVu turret that can be aimed after it is mounted. Published specs: 4 MP (2688 × 1520), 2.8 or 4 mm F1.0 lens, 1/1.8 inch sensor, and a built-in microphone. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 12,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 or 4 mm, F1.0',
                    'Audio' => 'Built-in microphone',
                ],
            ],
            [
                'name' => 'DS-2DE4425IW-DE',
                'slug' => 'hikvision-ds-2de4425iw-de',
                'category' => 'PTZ Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-ptz.svg',
                'short_description' => '4 MP 25× IR speed dome',
                'description' => 'Hikvision IR speed dome for open yards and long sight lines. Published specs: 4 MP (2560 × 1440), 25× optical zoom from 4.8 mm to 120 mm, IR up to 100 m, 360° pan, and tilt from −15° to 90°. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 13,
                'specifications' => [
                    'Resolution' => '4 MP (2560 × 1440)',
                    'Zoom' => '25× optical, 4.8–120 mm',
                    'Night Vision' => 'IR up to 100 m',
                ],
            ],
            [
                'name' => 'DS-2CD2087G2-LU',
                'slug' => 'hikvision-ds-2cd2087g2-lu',
                'category' => 'Bullet Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-bullet-4k.svg',
                'short_description' => '8 MP ColorVu fixed bullet',
                'description' => 'Hikvision 4K ColorVu bullet listed on the Philippines product site. Published specs: 8 MP (3840 × 2160), 1/1.2 inch sensor, F1.0 lens in 2.8, 4, or 6 mm, 130 dB WDR, white light up to 40 m, built-in microphone, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 14,
                'specifications' => [
                    'Resolution' => '8 MP (3840 × 2160)',
                    'Lens' => '2.8 / 4 / 6 mm, F1.0',
                    'Night Vision' => 'ColorVu white light up to 40 m',
                ],
            ],
            [
                'name' => 'DS-2CD2047G2H-LIU/SL',
                'slug' => 'hikvision-ds-2cd2047g2h-liu-sl',
                'category' => 'Bullet Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-bullet-hybrid.svg',
                'short_description' => '4 MP hybrid-light bullet with strobe',
                'description' => 'Hikvision Smart Hybrid Light bullet with a strobe and speaker. Published specs: 4 MP (2688 × 1520), F1.0 lens in 2.8, 4, or 6 mm, IR and white light up to 40 m, two-way audio, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 15,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 / 4 / 6 mm, F1.0',
                    'Night Vision' => 'IR and white light up to 40 m',
                ],
            ],
            [
                'name' => 'DS-2CD2387G2H-LIU',
                'slug' => 'hikvision-ds-2cd2387g2h-liu',
                'category' => 'Turret Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-turret-8mp.svg',
                'short_description' => '8 MP hybrid-light ColorVu turret',
                'description' => 'Hikvision Smart Hybrid Light turret. Published specs: 8 MP (3840 × 2160), 2.8 or 4 mm F1.0 lens, IR and white light up to 40 m, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 16,
                'specifications' => [
                    'Resolution' => '8 MP (3840 × 2160)',
                    'Lens' => '2.8 or 4 mm, F1.0',
                    'Night Vision' => 'IR and white light up to 40 m',
                ],
            ],
            [
                'name' => 'DS-2CD2347G2H-LIU',
                'slug' => 'hikvision-ds-2cd2347g2h-liu',
                'category' => 'Turret Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-turret-hybrid.svg',
                'short_description' => '4 MP hybrid-light ColorVu turret',
                'description' => 'Hikvision Smart Hybrid Light turret. Published specs: 4 MP (2688 × 1520), 2.8 or 4 mm F1.0 lens, 130 dB WDR, IR and white light up to 30 m, built-in microphone, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 17,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 or 4 mm, F1.0',
                    'Night Vision' => 'IR and white light up to 30 m',
                ],
            ],
            [
                'name' => 'DS-2CD2747G2HT-LIZS',
                'slug' => 'hikvision-ds-2cd2747g2ht-lizs',
                'category' => 'Dome Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-dome-motor.svg',
                'short_description' => '4 MP motorized hybrid-light dome',
                'description' => 'Hikvision motorized dome for entrances that need the view tightened after installation. Published specs: 4 MP (2688 × 1520), 2.8–12 mm lens, IR and white light up to 40 m, IP67 and IK10. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 18,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8–12 mm motorized',
                    'Night Vision' => 'IR and white light up to 40 m',
                ],
            ],
            [
                'name' => 'DS-2SE4C425MWG-E',
                'slug' => 'hikvision-ds-2se4c425mwg-e',
                'category' => 'PTZ Camera',
                'brand' => 'Hikvision',
                'image_path' => '/media/products/suppliers/hikvision-tandemvu.svg',
                'short_description' => '4 MP + 4 MP TandemVu 25× speed dome',
                'description' => 'Hikvision TandemVu speed dome with a fixed overview channel and a zoom channel. Published specs: 4 MP (2560 × 1440) on each channel, 25× optical zoom from 4.8 mm to 120 mm, IR up to 100 m, white light up to 30 m, and 360° pan. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 19,
                'specifications' => [
                    'Resolution' => '4 MP + 4 MP (2560 × 1440)',
                    'Zoom' => '25× optical, 4.8–120 mm',
                    'Night Vision' => 'IR 100 m · white light 30 m',
                ],
            ],
            [
                'name' => 'IPC-HFW3849T1-AS-PV',
                'slug' => 'dahua-ipc-hfw3849t1-as-pv',
                'category' => 'Bullet Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-bullet.svg',
                'short_description' => '8 MP active-deterrence bullet',
                'description' => 'Dahua WizSense bullet with active deterrence. Published for the 2.8 mm S4 version: 8 MP (3840 × 2160) and sound-and-light alarm. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 20,
                'specifications' => [
                    'Resolution' => '8 MP (3840 × 2160)',
                    'Lens' => '2.8 mm fixed',
                    'Alarm' => 'Sound and light deterrence',
                ],
            ],
            [
                'name' => 'IPC-HDW3849H-AS-PV',
                'slug' => 'dahua-ipc-hdw3849h-as-pv',
                'category' => 'Turret Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-turret.svg',
                'short_description' => '8 MP TiOC eyeball turret',
                'description' => 'Dahua 8 MP eyeball turret with smart dual illumination. Published S5 specs: 3840 × 2160, 2.8 or 3.6 mm F1.0 lens, IR and warm light up to 30 m, IP67, dual microphones, speaker, and red/blue warning lights. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 21,
                'specifications' => [
                    'Resolution' => '8 MP (3840 × 2160)',
                    'Lens' => '2.8 or 3.6 mm, F1.0',
                    'Night Vision' => 'IR and warm light up to 30 m',
                ],
            ],
            [
                'name' => 'IPC-HDBW3849R1-ZAS-PV',
                'slug' => 'dahua-ipc-hdbw3849r1-zas-pv',
                'category' => 'Dome Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-dome.svg',
                'short_description' => '8 MP motorized active-deterrence dome',
                'description' => 'Dahua vari-focal dome for entrances that need a tighter or wider view after installation. Published specs: 8 MP (3840 × 2160), 2.7–13.5 mm motorized lens, IR up to 50 m, warm light up to 40 m, IP67 and IK10. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 22,
                'specifications' => [
                    'Resolution' => '8 MP (3840 × 2160)',
                    'Lens' => '2.7–13.5 mm motorized',
                    'Night Vision' => 'IR 50 m · warm light 40 m',
                ],
            ],
            [
                'name' => 'IPC-HFW2541T-ZS',
                'slug' => 'dahua-ipc-hfw2541t-zs',
                'category' => 'Bullet Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-bullet-5mp.svg',
                'short_description' => '5 MP motorized IR bullet',
                'description' => 'Dahua WizSense bullet listed on the Philippines site. Published specs: 5 MP (2592 × 1944), motorized 2.7–13.5 mm lens, IR up to 60 m, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 23,
                'specifications' => [
                    'Resolution' => '5 MP (2592 × 1944)',
                    'Lens' => '2.7–13.5 mm motorized',
                    'Night Vision' => 'IR up to 60 m',
                ],
            ],
            [
                'name' => 'IPC-HFW3441DG-AS-4G',
                'slug' => 'dahua-ipc-hfw3441dg-as-4g',
                'category' => 'Bullet Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-bullet-4g.svg',
                'short_description' => '4 MP 4G bullet with warm light',
                'description' => 'Dahua 4G bullet for sites without a network cable. Published specs for the Philippines EAU-B model: 4 MP (2688 × 1520), 2.8, 3.6, or 6 mm lens, IR up to 50 m, warm light up to 30 m, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 24,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 / 3.6 / 6 mm',
                    'Night Vision' => 'IR 50 m · warm light 30 m',
                ],
            ],
            [
                'name' => 'IPC-HDW2441T-S',
                'slug' => 'dahua-ipc-hdw2441t-s',
                'category' => 'Turret Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-turret-4mp.svg',
                'short_description' => '4 MP IR turret with microphone',
                'description' => 'Dahua WizSense eyeball turret. Published specs: 4 MP (2688 × 1520), 2.8 or 3.6 mm lens, IR up to 30 m, built-in microphone, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 25,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 or 3.6 mm',
                    'Night Vision' => 'IR up to 30 m',
                ],
            ],
            [
                'name' => 'IPC-HDBW3441E-AS',
                'slug' => 'dahua-ipc-hdbw3441e-as',
                'category' => 'Dome Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-dome-4mp.svg',
                'short_description' => '4 MP IR fixed dome',
                'description' => 'Dahua WizSense dome for entrances. Published specs for the S2 model: 4 MP (2688 × 1520), 2.8, 3.6, or 6 mm lens, IR up to 50 m, built-in microphone, IP67 and IK10. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 26,
                'specifications' => [
                    'Resolution' => '4 MP (2688 × 1520)',
                    'Lens' => '2.8 / 3.6 / 6 mm',
                    'Night Vision' => 'IR up to 50 m',
                ],
            ],
            [
                'name' => 'SD49425XB-HNR-G',
                'slug' => 'dahua-sd49425xb-hnr-g',
                'category' => 'PTZ Camera',
                'brand' => 'Dahua',
                'image_path' => '/media/products/suppliers/dahua-ptz.svg',
                'short_description' => '4 MP 25× IR 4G speed dome',
                'description' => 'Dahua WizSense speed dome for open sites. Published specs: 4 MP (2560 × 1440), 25× optical zoom from 4.8 mm to 120 mm, IR up to 100 m, 4G, PoE+, and IP66. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 27,
                'specifications' => [
                    'Resolution' => '4 MP (2560 × 1440)',
                    'Zoom' => '25× optical, 4.8–120 mm',
                    'Night Vision' => 'IR up to 100 m',
                ],
            ],
            [
                'name' => 'Bullet 2E Pro',
                'slug' => 'imou-bullet-2e-pro',
                'category' => 'Bullet Camera',
                'brand' => 'Imou',
                'image_path' => '/media/products/suppliers/imou-bullet.svg',
                'short_description' => '3 MP outdoor Wi-Fi bullet',
                'description' => 'Imou outdoor bullet for gates and perimeter walls. Published specs: 3 MP (2304 × 1296), 2.8 or 3.6 mm lens, night vision 25 m, human and vehicle detection, microSD up to 512 GB, Wi-Fi 6, Ethernet, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 30,
                'specifications' => [
                    'Resolution' => '3 MP (2304 × 1296)',
                    'Lens' => '2.8 or 3.6 mm fixed',
                    'Night Vision' => 'Up to 25 m',
                ],
            ],
            [
                'name' => 'Bullet 3',
                'slug' => 'imou-bullet-3',
                'category' => 'Bullet Camera',
                'brand' => 'Imou',
                'image_path' => '/media/products/suppliers/imou-bullet-3.svg',
                'short_description' => '3 MP bullet with spotlight and siren',
                'description' => 'Imou bullet with a spotlight and a 110 dB siren. Published specs: 3 MP (2304 × 1296), 2.8 or 3.6 mm lens, night vision 30 m, human and vehicle detection, microSD up to 512 GB, and IP67. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 31,
                'specifications' => [
                    'Resolution' => '3 MP (2304 × 1296)',
                    'Lens' => '2.8 or 3.6 mm fixed',
                    'Night Vision' => 'Up to 30 m',
                ],
            ],
            [
                'name' => 'Turret SE',
                'slug' => 'imou-turret-se',
                'category' => 'Turret Camera',
                'brand' => 'Imou',
                'image_path' => '/media/products/suppliers/imou-turret.svg',
                'short_description' => '2 MP Wi-Fi turret',
                'description' => 'Imou turret for eaves and covered outdoor corners. Published specs: 2 MP (1920 × 1080), 2.8 or 3.6 mm lens, night vision 30 m, built-in microphone, and microSD up to 256 GB. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 32,
                'specifications' => [
                    'Resolution' => '2 MP (1920 × 1080)',
                    'Lens' => '2.8 or 3.6 mm fixed',
                    'Night Vision' => 'Up to 30 m',
                ],
            ],
            [
                'name' => 'Ranger 2 Pro 4K',
                'slug' => 'imou-ranger-2-pro-4k',
                'category' => 'PTZ Camera',
                'brand' => 'Imou',
                'image_path' => '/media/products/suppliers/imou-ranger.svg',
                'short_description' => '8 MP indoor pan-and-tilt camera',
                'description' => 'Imou indoor pan-and-tilt camera. Published specs: 8 MP (3840 × 2160), 3.6 mm lens, 355° pan and −5° to 80° tilt, night vision 20 m, two-way audio, and dual-band Wi-Fi 6. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 33,
                'specifications' => [
                    'Resolution' => '8 MP (3840 × 2160)',
                    'Lens' => '3.6 mm fixed',
                    'Pan / Tilt' => '355° pan, −5° to 80° tilt',
                ],
            ],
            [
                'name' => 'Cruiser Dual 2 Pro',
                'slug' => 'imou-cruiser-dual-2-pro',
                'category' => 'PTZ Camera',
                'brand' => 'Imou',
                'image_path' => '/media/products/suppliers/imou-ptz.svg',
                'short_description' => 'Dual 4 MP outdoor pan-and-tilt camera',
                'description' => 'Imou outdoor camera with a fixed lens and a pan-and-tilt lens. Published specs: 4 MP (2560 × 1440) on each lens, 3.6 mm, night vision 30 m, red and blue warning lights, and two-way audio. The supply price is confirmed in the quotation.',
                'approx_price' => 0,
                'sort_order' => 34,
                'specifications' => [
                    'Resolution' => '4 MP + 4 MP (2560 × 1440)',
                    'Lens' => '3.6 mm on each lens',
                    'Night Vision' => 'Up to 30 m',
                ],
            ],
        ];

        $knownSlugs = array_column($products, 'slug');
        $dahuaCatalog = json_decode(
            (string) file_get_contents(database_path('seeders/data/dahua-cameras.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );
        foreach ($dahuaCatalog as $camera) {
            if (! in_array($camera['slug'], $knownSlugs, true)) {
                $products[] = $camera;
            }
        }

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                [...Product::withPlaceholderPrices($product), 'is_active' => true],
            );
        }

        Product::query()
            ->whereIn('slug', [
                'eyemax-nir-e8062v-w',
                'eyemax-niu-e4042-w28a',
                'eyemax-nit-e8032',
                'eyemax-npt-ir-e2145',
            ])
            ->update(['is_active' => false]);
    }
}
