<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */
use App\User;
use App\Complaint;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Faker\Generator as Faker;
use Illuminate\Support\Carbon;

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| This directory should contain each of the model factory definitions for
| your application. Factories provide a convenient way to generate new
| model instances for testing / seeding your application's database.
|
 */

$factory->define(User::class, function (Faker $faker) {
    $phone = '';
    for ($x = 0; $x < 10; $x++) {
        $phone .= $faker->randomDigitNotNull;
        if ($x == 2 || $x == 5) {$phone .= "-";}
    }
    $new = [
        'first_name' => $faker->firstName,
        'middle_name' => $faker->firstName,
        'last_name' => $faker->lastName,
        // 'email' => $email,
        // 'username' => $email,
        'date_of_birth' => $faker->dateTimeThisCentury,
        'phone' => $phone,
        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    ];
    $new['email'] = $faker->toLower($new['first_name'] . '.' . $new['last_name'] . '@example.com');
    $new['username'] = $new['email'];
    return $new;
});

$factory->state(User::class, 'practitioner', [
    'roles' => ['list' => ['practitioner'], 'default' => null],
]);
$factory->state(User::class, 'patient', [
    'roles' => ['list' => ['patient'], 'default' => null],
]);
$factory->afterCreatingState(User::class, 'patient', function ($user, $faker) {
    $complaints = Complaint::select('id')->get()->map(function ($complaint) {return $complaint->id;})->toArray();
    $user->patient->complaints()->sync(random($complaints, 3));
});
$factory->state(User::class, 'staff member', [
    'roles' => ['list' => ['staff member'], 'default' => null],
]);
