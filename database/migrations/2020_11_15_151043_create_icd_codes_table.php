<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIcdCodesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('icd_codes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('code');
            $table->string('title');
            $table->string('text');
            $table->string('url');
            $table->unique(['code','text']);
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
        Schema::dropIfExists('icd_codes');
    }
}
