<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use App\Appointment;
use App\Patient;
use App\Practitioner;
use App\Service;
use Faker\Generator as Faker;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;


include_once app_path("/php/functions.php");

$factory->define(Appointment::class, function (Faker $faker) {
	$practitionerIds = Practitioner::all()->modelKeys();
	$practitionerId = Arr::random($practitionerIds);
	$hours = [9,10,11,12,13,14,15,16,17,18];
	$minutes= [0,15,30,45];
	$weekdays = [1,2,3,4,5];
	$start = Carbon::now();
	$end = Carbon::now()->addWeeks(4);
	$random = Carbon::createFromTimestamp(rand($start->timestamp, $end->timestamp));
	while (!in_array($random->dayOfWeek, $weekdays)){
		$random = Carbon::createFromTimestamp(rand($start->timestamp, $end->timestamp));
	}
	$random->setTime(randomElement($hours), randomElement($minutes), 0);
	
    return [
        'uuid' => uuidNoDash(),
        'practitioner_id' => $practitionerId,
        'date_time' => $random->toDateTimeString(),
        'status' => [
            'scheduled_at' => Carbon::now()->toDateTimeString(),
            'rescheduled_at' => false,
            'canceled' => false,
            'completed' => false,
            'invoiced' => false,
            'paid' => false
        ],
        'duration' => 0,
        'staff_member_note' => json_encode([$faker->paragraph($nbSentences = 1, $variableNbSentences = true)]),
        'practitioner_note' => json_encode([$faker->paragraph($nbSentences = 3, $variableNbSentences = true)])
    ];
});

$factory->afterCreating(App\Appointment::class, function ($appointment, $faker) {
	$service = randomElement(Service::where('addon_only',0)->get()->modelKeys());
	$patient = randomElement(Patient::all()->modelKeys());
    // Log::info($appointment);
    $appointment->services()->sync([$service]);
    $appointment->patients()->sync([$patient]);
    $duration = $appointment->services->map(function($serv){return $serv->duration;})->toArray()[0];
    $appointment->duration = $duration;
    $appointment->save();
});

// $factory->state(Appointment::class, )