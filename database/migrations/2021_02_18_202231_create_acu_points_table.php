<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAcuPointsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection('clinicwizard_base')->create('acu_points', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name_pinyin')->nullable()->default(null);
            $table->string('name_english')->nullable()->default(null);
            $table->string('number');
            $table->string('channel');
            $table->string('actions');
            $table->string('indications');
            $table->json('settings')->nullable()->default(null);            
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
        Schema::dropIfExists('acu_points');
    }
}
