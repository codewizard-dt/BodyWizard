<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFormsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('forms', function (Blueprint $table) {
            $table->bigIncrements('form_uid');
            $table->unsignedInteger('form_id');
            $table->unsignedInteger('version_id');
            $table->string('form_name');
            $table->json('questions');
            $table->json('settings')->nullable()->default(null);
            $table->json('settings_json')->nullable()->default(null);
            $table->json('full_json');
            $table->boolean('has_submissions')->default(false);
            $table->boolean('locked')->default(false);
            $table->boolean('current')->default(true);
            $table->string('form_type')->default("patient");
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
        Schema::dropIfExists('forms');
    }
}
