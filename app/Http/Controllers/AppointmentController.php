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

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $usertype = Auth::user()->user_type;
        return listReturn(view("portal.$usertype.appointments.display")->render());        
    }

    // public function getChartNote($uid, Request $request){
    //     try{
    //         $appt = Appointment::findOrFail($uid);
    //         $chartNote = $appt->chartNote;
    //         return $chartNote ? $chartNote : 'null';
    //     }catch(\Exception $e){
    //         reportError($e,'AppointmentController 40');
    //         return 'null';
    //     }
    // }
    public function editChartNote($uid, Request $request){
        return view('portal.practitioner.chart_notes.edit',['apptId'=>$uid]);
    }
    // public function getInvoice($uid, Request $request){
    //     try{
    //         $appt = Appointment::findOrFail($uid);
    //         $invoice = $appt->invoice;
    //         return $invoice ? $invoice : 'null';
    //     }catch(\Exception $e){
    //         reportError($e,'AppointmentController 53');
    //         return 'null';
    //     }
    // }
    public function editInvoice($uid, Request $request){
        return view('portal.practitioner.invoices.edit',['apptId'=>$uid]);
    }
}
