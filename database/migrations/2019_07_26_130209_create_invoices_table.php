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
            $table->string('stripe_id')->nullable()->collation('utf8mb4_bin');
            $table->unsignedInteger('invoiced_to_user_id');
            $table->unsignedInteger('created_by_user_id');
            $table->unsignedInteger('appointment_id')->nullable();
            $table->unsignedInteger('total_charge');
            $table->datetime('paid_at')->nullable();
            $table->json('status')->nullable();
            $table->json('payments')->nullable();
            $table->longtext('line_items')->nullable();
            $table->longtext('notes')->nullable();
            $table->longtext('autosave')->nullable();
            $table->timestamps();
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
