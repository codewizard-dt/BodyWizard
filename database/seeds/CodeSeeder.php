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

        $cpts = [
            ['97810', 'Initial Acupuncture', "Initial 15-minute insertion of needles, personal one-on-one contact with the patient. (Do not report in conjunction with 97813; use one or the other.)"],

            ['97811', 'Subsequent Unit of Acupuncture', "Use one unit per each additional 15 minutes of personal one-on-one contact with the patient after the initial 15 minutes, with re-insertion of needles. (May be used in conjunction with either 97810 or 97813.)"],

            ['97813', 'Initial Acupuncture with Electrical Stimulation', "Initial 15-minute insertion of needles, personal one-on-one contact with the patient. (Do not report in conjunction with 97810; use one or the other.)"],

            ['97814', 'Subsequent Unit of Acupuncture with Electrical Stimulation', "Use one unit per each additional 15 minutes of personal one-on-one contact with the patient, with re-insertion of needles. (May be used in conjunction with either 97810 or 97813.)"],
        ];
        foreach ($cpts as $cpt) {
            CptCode::create(['code' => $cpt[0], 'title' => $cpt[1], 'text' => $cpt[2]]);
        }
    }
}
