<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('brand')->default('EVOCom')->after('category');
            $table->string('image_path')->nullable()->after('brand');
        });

        $renames = [
            'Dome' => 'Dome Camera',
            'Bullet' => 'Bullet Camera',
            'PTZ' => 'PTZ Camera',
            'Turret' => 'Turret Camera',
            'Multi-Sensor' => 'Multi-Sensor Camera',
        ];

        foreach ($renames as $from => $to) {
            DB::table('products')->where('category', $from)->update(['category' => $to]);
        }

        $catalog = [
            'evoshield-dome-4k' => ['/media/products/dome-camera.jpg', 'Dome Camera'],
            'evoguard-bullet-pro' => ['/media/products/bullet-camera.jpg', 'Bullet Camera'],
            'evopan-360-ptz' => ['/media/products/ptz-camera.jpg', 'PTZ Camera'],
            'evoslim-mini-dome' => ['/media/products/mini-dome.jpg', 'Dome Camera'],
            'evowatch-turret-5mp' => ['/media/products/turret-camera.jpg', 'Turret Camera'],
            'evoarray-360-multi' => ['/media/products/multi-sensor.jpg', 'Multi-Sensor Camera'],
        ];

        foreach ($catalog as $slug => [$image, $category]) {
            DB::table('products')->where('slug', $slug)->update([
                'brand' => 'EVOCom',
                'category' => $category,
                'image_path' => $image,
            ]);
        }

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_request_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('paid_on');
            $table->string('method');
            $table->text('remarks')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['brand', 'image_path']);
        });
    }
};
