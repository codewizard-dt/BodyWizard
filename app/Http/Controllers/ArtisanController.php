<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class ArtisanController extends Controller
{
    //
    public function home(Request $request){
    	return "";
    }
    public function execute(Request $request, $command){
    	if ($command == 'refresh-appointments'){
    		Artisan::call("refresh:appointments",[
    			'practiceId' => session('practiceId'),
    		]);
    		$message = 'Appointments cleared.';
    	}elseif($command == 'update-appointments'){
            \App\Practice::updateEntireEventFeed();
            $message = 'Appointment feed updated.';
        }else{
    		$message = 'command not recognized';
    	}
    	return $message;
    }
}
