<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $forms = json_decode(Storage::get('/system_forms.json'), true);
        foreach ($forms as $form) {\App\Form::create($form);}

        //
    }
}
