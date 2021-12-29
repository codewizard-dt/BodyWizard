<?php

use Illuminate\Database\Seeder;
use Faker\Generator as Faker;
use App\IcdCode;
use App\CptCode;

class CodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(Faker $faker)
    {
        // icd => code, title,  url
        // cpt => code, title,
        $icds = [
            ['7A01', 'Short-term insomnia'],
            ['ME05.0', 'Constipation'],
            ['8A8Z', 'Headache disorders, unspecified'],
        ];
        foreach ($icds as $icd) {
            IcdCode::create(['code' => $icd[0], 'title' => $icd[1]]);
        }
    }
}
