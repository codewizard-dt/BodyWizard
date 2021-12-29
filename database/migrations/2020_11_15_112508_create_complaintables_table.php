<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComplaintablesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('complaintables', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('complaint_id');
            $table->unsignedInteger('complaintable_id');
            $table->string('complaintable_type');
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
        Schema::dropIfExists('complaintables');
    }
}
