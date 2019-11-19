<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */
use App\User;
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
	$email = $faker->unique()->safeEmail;
	// $date = now();
    $phone = '';
    for ($x = 0; $x < 10; $x++){
        $phone .= $faker->randomDigitNotNull;
        if ($x == 2 || $x == 5){$phone .= "-";}
    }
    $new = [
        'first_name' => $faker->firstName,
        'middle_name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'email' => $email,
        'username' => $email,
        'date_of_birth' => $faker->dateTimeThisCentury,
        'phone' => $phone,
        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        'full_json' => null
    ];
    $new['full_json'] = '{"Sections": [{"Name": "Personal Information", "Items": [{"type": "date", "question": "Date of Birth", "response": ["'.Carbon::parse($new['date_of_birth'])->format('d/m/Y').'"]}, {"type": "text", "question": "First Name", "response": ["'.$new['first_name'].'"]}, {"type": "text", "question": "Middle Name", "response": ["'.$new['middle_name'].'"]}, {"type": "text", "question": "Last Name", "response": ["'.$new['last_name'].'"]}, {"type": "text", "question": "Preferred Name", "response": []}]}, {"Name": "Contact Information", "Items": [{"type": "text", "question": "Phone Number", "response": ["'.$new['phone'].'"]}, {"type": "text", "question": "Email Address", "response": ["'.$new['email'].'"]}]}, {"Name": "Login Information", "Items": [{"type": "narrative", "question": "", "response": []}, {"type": "text", "question": "Username", "response": []}, {"type": "text", "question": "Password", "response": []}, {"type": "text", "question": "Confirm Password", "response": []}]}]}';
    // Log::info($new);
    return $new;
});

$factory->state(User::class, 'practitioner', [
    'user_type' => 'practitioner'
]);
$factory->state(User::class, 'patient', [
    'user_type' => 'patient'
]);
$factory->state(User::class, 'staff member', [
    'user_type' => 'staff member'
]);

