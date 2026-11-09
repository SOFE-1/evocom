<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_request_id')->constrained()->cascadeOnDelete();
            $table->string('category', 80);
            $table->string('description', 200);
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->boolean('finalized')->default(false);
            $table->timestamps();
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_request_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cancelled_by');
            $table->dropColumn('cancelled_at');
        });

        Schema::dropIfExists('quote_charges');
    }
};
