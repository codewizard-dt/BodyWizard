<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\RefreshTables;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('first_name');
            $table->string('middle_name')->nullable()->default(null);
            $table->string('last_name');
            $table->string('preferred_name')->nullable()->default(null);
            $table->json('roles')->nullable();
            $table->string('username')->unique();
            $table->date('date_of_birth');
            $table->string('email');
            $table->string('phone');
            $table->json('address_mailing')->nullable();
            $table->json('address_billing')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->json('security')->nullable();
            $table->json('settings')->nullable()->default(null);

            $table->softDeletes();
            $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
}
