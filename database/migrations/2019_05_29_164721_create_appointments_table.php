<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAppointmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('google_id');
            $table->unsignedInteger('patient_id')->nullable();
            $table->unsignedInteger('practitioner_id')->nullable();
            $table->dateTimeTz('date_time_start');
            $table->dateTimeTz('date_time_end');
            $table->json('recurrence')->nullable();
            $table->string('rrule')->nullable();
            $table->unsignedInteger('recurring_id')->nullable();
            $table->mediumtext('notes')->nullable();
            $table->json('status')->nullable();
            $table->string('appt_link')->nullable();
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
        Schema::dropIfExists('appointments');
    }
}
