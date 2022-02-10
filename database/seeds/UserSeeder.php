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
        $patient = new User();
        $patient->first_name = "Patient";
        $patient->last_name = "Demo";
        $patient->roles = ['list' => ['patient'], 'default' => null];
        $patient->username = "patient";
        $patient->date_of_birth = '1985-10-14';
        $patient->email = "patient@example.com";
        $patient->phone = "512-321-4321";
        $patient->save();
        $practitioner = new User();
        $practitioner->first_name = "Practitioner";
        $practitioner->last_name = "Demo";
        $practitioner->roles = ['list' => ['practitioner'], 'default' => null];
        $practitioner->username = "practitioner";
        $practitioner->date_of_birth = '1985-10-14';
        $practitioner->email = "practitioner@example.com";
        $practitioner->phone = "512-321-4321";
        $practitioner->save();
        $staff = new User();
        $staff->first_name = "Staff";
        $staff->last_name = "Demo";
        $staff->roles = ['list' => ['staff member'], 'default' => null];
        $staff->username = "staff";
        $staff->date_of_birth = '1985-10-14';
        $staff->email = "staff@example.com";
        $staff->phone = "512-321-4321";
        $staff->save();
        factory(User::class, 10)->states('patient')->create();
        factory(User::class, 2)->states('practitioner')->create();
        factory(User::class, 2)->states('staff member')->create();
    }
}
