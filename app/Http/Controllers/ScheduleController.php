<?php

namespace App\Http\Controllers;

use App\Practitioner;
use App\Patient;
use App\Practice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
// use Google\Cloud\Logging\LoggingClient;


class ScheduleController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function scheduleFeed(Request $request){
        return view('schedules.feeds', compact('request'));
    }

    //SCHEDULES
        // public function EditSchedule($model, $uid){
        //     return view('portal.admin.schedule-edit',[
        //         'model' => $model,
        //         "uid" => $uid
        //     ]);            
        // }
        // public function EditPracticeSchedule(){
        //     return view('portal.admin.schedule-edit',[
        //         'model' => 'Practice',
        //         'uid' => Practice::getFromSession()->id
        //     ]);
        // }
        // public function SavePracticeSchedule(Request $request){
        //     $practice = \App\Practice::getFromSession();
        //     $newSchedule = revertJsonBool($request->schedule);
        //     $newBizHours = scheduleToFullCalBizHours($newSchedule);
        //     if ($practice->schedule){
        //         $practice->schedule['practice'] = $newSchedule;
        //         $practice->schedule['business_hours'] = $newBizHours;
        //     }else{
        //         $practice->schedule = ['practice'=>$newSchedule,'business_hours'=>$newBizHours];
        //     }
        //     $practice->save();
        //     return 'checkmark';
        // }
}
