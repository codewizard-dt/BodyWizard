<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChartNotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chart_notes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('patient_id');
            $table->unsignedInteger('practitioner_id');
            $table->unsignedInteger('appointment_id');
            $table->json('icd_codes')->nullable();
            $table->json('cpt_codes')->nullable();
            $table->json('forms')->nullable();
            $table->dateTime('date_time_start');
            $table->dateTime('date_time_end')->nullable();
            $table->json('notes')->nullable();
            $table->json('signature')->nullable();
            $table->dateTime('signed_at')->nullable();
            $table->timestampsTz();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('chart_notes');
    }
}
