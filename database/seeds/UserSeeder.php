<?php

use Illuminate\Database\Seeder;
use App\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $super = new User();
        $super->first_name = "Bryan";
        $super->middle_name = "David";
        $super->last_name = "Taylor";
        $super->preferred_name = "David";
        $super->roles = ['list' => ['practitioner', 'patient', 'staff member'], 'default' => 'practitioner'];
        $super->username = "david";
        $super->date_of_birth = '1985-10-14';
        $super->email = "david@codewizard.app";
        $super->phone = "512-514-3706";
        $super->password = '$2y$10$chX/ZsWKiiEaLrI59N5nkuYYb.VZi9WXEf53DPmq.ko1iIGZVjyt2';
        $super->save();
        factory(User::class, 10)->states('patient')->create();
        factory(User::class, 2)->states('practitioner')->create();
        factory(User::class, 2)->states('staff member')->create();
    }
}
