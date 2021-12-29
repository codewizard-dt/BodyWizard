<?php

use Illuminate\Database\Seeder;
use App\Practice;

class PracticeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Practice::create(['name' => 'Body Wizard']);
    }
}
