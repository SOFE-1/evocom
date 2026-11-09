<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price_max', 12, 2)->nullable()->after('approx_price');
        });

        $rows = DB::table('products')->select('id', 'category', 'approx_price')->get();
        foreach ($rows as $row) {
            $priced = Product::withPlaceholderPrices([
                'category' => (string) $row->category,
                'approx_price' => $row->approx_price,
            ]);

            DB::table('products')->where('id', $row->id)->update([
                'approx_price' => $priced['approx_price'],
                'price_max' => $priced['price_max'],
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('price_max');
        });
    }
};
