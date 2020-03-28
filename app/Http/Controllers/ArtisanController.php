<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use App\Practice;

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
            $practice = Practice::getFromSession();
            $practice->updateEntireEventFeed();
            $message = 'Appointment feed updated.';
        }elseif($command == 'refresh-users'){
            $practice = Practice::getFromSession();
            $result = $practice->refreshUsers();
            $message = ($result === true) ? 'Users refreshed.' : $result;
        }else{
    		$message = 'command not recognized';
    	}
    	return $message;
    }
}
