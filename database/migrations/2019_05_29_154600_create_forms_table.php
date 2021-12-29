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
            $table->bigIncrements('id');
            $table->unsignedInteger('form_id');
            $table->unsignedInteger('version_id');
            $table->string('name');
            $table->json('settings')->nullable()->default(null);
            $table->json('sections')->nullable()->default(null);
            $table->timestampsTz();
        });
        $forms = json_decode(Storage::get('/basicEhr/forms2.json'), true);
        foreach ($forms as $form) {\App\Form::create($form);}
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
