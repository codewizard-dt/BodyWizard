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
            $table->string('uuid');
            $table->unsignedInteger('practitioner_id')->nullable();
            $table->dateTimeTz('date_time');
            $table->unsignedInteger('duration');
            $table->text('staff_member_note')->nullable();
            $table->text('practitioner_note')->nullable();
            $table->json('status');
            $table->string('appt_link')->nullable();
            $table->json('full_json')->nullable();
            $table->timestamps();
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
        Schema::dropIfExists('appointments');
    }
}
