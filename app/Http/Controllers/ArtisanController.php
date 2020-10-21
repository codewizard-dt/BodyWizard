<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use App\Practice;
use App\RefreshTables;

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
        }elseif($command == 'refresh-complaints'){
            $result = RefreshTables::clearComplaintTables();
            $message = ($result === true) ? 'Complaints + categories refreshed.' : $result;
        }elseif($command == 'refresh-bugs'){
            $result = RefreshTables::clearBugTables();
            $message = ($result === true) ? 'Bugs refreshed.' : $result;
        }elseif($command == 'reset-uids'){
            unsetAllUids();
            $message = 'UIDs reset.';
        }else{
    		$message = 'command not recognized';
    	}
        session()->forget('uidList');
    	return $message.' <div class="button pink" data-action="request.refresh_page">go back</div>';
    }
}
