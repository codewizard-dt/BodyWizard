<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateServicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('services', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('service_category_id')->nullable()->default(null);
            $table->text('description_calendar');
            $table->text('description_admin');
            $table->unsignedInteger('display_order')->default("1");
            $table->boolean('is_addon')->default(false);
            $table->string('addon_services')->nullable()->default(null);
            $table->boolean('new_patients_ok')->default(false);
            $table->boolean('new_patients_only')->default(false);
            $table->unsignedInteger('duration');
            $table->json('full_json');
            $table->json('settings')->nullable()->default(null);
            $table->json('settings_json')->nullable()->default(null);            
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
        Schema::dropIfExists('services');
    }
}
