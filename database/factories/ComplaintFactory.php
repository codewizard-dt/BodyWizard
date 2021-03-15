<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Complaint;
use App\ComplaintCategory;
use App\IcdCode;
use Faker\Generator as Faker;

$factory->define(Complaint::class, function (Faker $faker) {
	  $categories = ComplaintCategory::select('id')->get()->map(function($category){return $category->id;})->toArray();
    return [
			'name' => $faker->words(3,true),
			'description' => $faker->text(150),
			'complaint_category_id' => random($categories),
    ];
});
$factory->afterCreating(Complaint::class, function ($complaint) {
  $icd_codes = IcdCode::select('id')->get()->map(function($category){return $category->id;})->toArray();
  $complaint->icd_codes()->sync(random($icd_codes,3));
});