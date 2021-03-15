<?php

namespace App\Http\Controllers;

use App\Appointment;
use App\ChartNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
  public function __construct(){
    $this->middleware('auth');
  }

  // public function home () {
  //   $usertype = Auth::user()->user_type;
  //   return view("portal.$usertype.appointments.home");        
  // }

  public function calendar (Request $request) {
    return view('models.appointments.calendar',compact('request'));
  }

  public function feed (Request $request) {
    $appts = Appointment::all();
    // logger(request()->all());
    return $appts->toJson();
  }
}
