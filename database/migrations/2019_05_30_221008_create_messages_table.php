<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('sendgrid_id')->nullable()->default(null);
            $table->string('message_id');
            $table->unsignedInteger('sender_id')->nullable()->default(null);
            $table->unsignedInteger('recipient_id');
            $table->string('type');
            $table->longText('message');
            $table->string('subject')->nullable()->default(null);
            $table->unsignedInteger('template_id')->nullable()->default(null);
            $table->json('status');
            $table->softdeletes();
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
        Schema::dropIfExists('messages');
    }
}
