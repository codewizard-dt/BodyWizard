<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use App\Patient;
use Faker\Generator as Faker;

$factory->define(Patient::class, function (Faker $faker) {
    return [
        //
        'gender' => $faker->randomElement(['male','female','fluid','non-binary','other']),
        'sex' => $faker->randomElement(['male','female','intersex']),
        'pronouns' => 'them they their',
        'mailing_address' => $faker->address
    ];
});
