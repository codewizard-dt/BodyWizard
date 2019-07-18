<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCodesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('codes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('code_type');
            $table->string('icd_version')->nullable()->default(null);
            $table->text('code_description');
            $table->string('key_words')->nullable()->default(null);;
            $table->json('settings')->nullable()->default(null);
            $table->json('settings_json')->nullable()->default(null);            
            $table->json('full_json');
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
        Schema::dropIfExists('codes');
    }
}
