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
    		$message = 'Appointments reset';
    	}else{
    		$message = 'command not recognized';
    	}
    	return $message;
    }
}
