<?php

use Illuminate\Database\Seeder;
use Faker\Generator as Faker;
use App\Service;
use App\ServiceCategory;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(Faker $faker)
    {
        $serviceCategories = ['Acupuncture', 'Herbal Medicine', 'Assessment', 'Fasical Release'];
        $inserts = array_map(function ($name) use ($faker) {
            return [
                'name' => $name,
                'description' => $faker->text(150),
            ];
        }, $serviceCategories);
        foreach ($inserts as $category) {
            ServiceCategory::create($category);
        }

    }
}
