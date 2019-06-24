<?php

Namespace App\Services;

class Google 
{
	public function __constructor()
	{
		// app()->singleton('GoogleClient',function(){
		// 	$key = config('google')['key_file_location'];
		// 	$client = new Google_Client();
		// 	$client->setApplicationName("BodyWizard");
		// 	$client->setAuthConfig($key);
		// 	dd($client);
		// 	return $client;
		// });
		// app()->singleton('GoogleCalendar',function(){
		// 	$client = app('GoogleClient');
		//     $client->addScope("https://www.googleapis.com/auth/calendar");
		//     $calendar = new Google_Service_Calendar($client);
		//     return $calendar;
		// });
		app()->singleton('GoogleGmail',function(){
			$client = app('GoogleClient');
		    $client->addScope("https://www.googleapis.com/auth/gmail.modify");
		    $gmail = new Google_Service_Gmail($client);
		    return $gmail;
		});
	}
	public function initializeCalendar(){

	}

}