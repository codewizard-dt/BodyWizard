<?php

use Illuminate\Database\Seeder;
use Faker\Generator as Faker;
use App\ComplaintCategory;
use App\Complaint;

class ComplaintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(Faker $faker)
    {
        $categories = ['Pain', 'Digestion', 'Psychosocial', 'Sex + Reproduction', 'Respiration', 'Infection'];
        $inserts = array_map(function ($name) use ($faker) {
            return [
                'name' => $name,
                'description' => $faker->text(150),
            ];
        }, $categories);
        foreach ($inserts as $category) {
            ComplaintCategory::create($category);
        }
        factory(Complaint::class, 30)->create();

    }
}
