<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('invoiced_to_user_id');
            $table->unsignedInteger('created_by_user_id');
            $table->unsignedInteger('appointment_id')->nullable();
            $table->datetime('appointment_date_time')->nullable();
            $table->decimal('total_charge', 8, 2);
            $table->datetime('settled_at')->nullable();
            $table->string('stripe_payment_intent_id')->nullable()->collation('utf8mb4_bin');
            $table->json('payments')->nullable();
            $table->json('line_items')->nullable();
            $table->json('notes')->nullable();
            $table->json('autosave')->nullable();
            $table->timestampsTz();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoices');
    }
}
