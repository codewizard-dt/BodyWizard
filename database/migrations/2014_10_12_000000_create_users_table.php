<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

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
            // $table->string('user_type')->default('patient');
            // $table->boolean('is_admin')->default(false);
            $table->string('username')->unique();
            $table->date('date_of_birth');
            $table->string('email');
            $table->string('phone');
            $table->string('address_mailing')->nullable()->default(null);            
            $table->string('address_billing')->nullable()->default(null);            
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->json('security')->nullable();
            // $table->boolean('require_new_pw')->default(true);
            // $table->json('security_questions')->nullable()->default(null);
            // $table->string('stripe_id')->nullable()->collation('utf8mb4_bin');
            // $table->string('card_brand')->nullable();
            // $table->string('card_last_four', 4)->nullable();
            // $table->timestamp('trial_ends_at')->nullable();
            // $table->json('full_json')->nullable();
            $table->softDeletes();
            $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
}
