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
            $table->json('signature')->nullable();
            $table->datetime('signed_at')->nullable();
            $table->mediumtext('notes')->nullable();
            $table->mediumtext('points')->nullable();
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
        Schema::dropIfExists('chart_notes');
    }
}
