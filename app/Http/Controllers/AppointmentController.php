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

  public function home(){
    $usertype = Auth::user()->user_type;
    return view("portal.$usertype.appointments.home");        
  }

  public function calendar(Request $request) {
    return view('models.appointments.calendar',compact('request'));
  }
  public function index()
  {
    $usertype = Auth::user()->user_type;
    return view("portal.$usertype.appointments.display");
  }

  public function editChartNote($uid, Request $request){
    return view('portal.practitioner.chart_notes.edit',['apptId'=>$uid]);
  }
  public function editInvoice($uid, Request $request){
    return view('portal.practitioner.invoices.edit',['apptId'=>$uid]);
  }
}
