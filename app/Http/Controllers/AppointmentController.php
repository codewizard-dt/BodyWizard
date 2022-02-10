<?php

namespace App\Http\Controllers;

use App\Appointment;
use App\ChartNote;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function home()
    {
        $role = User::Role();
        return view("portal.$role.appointments.home");
    }

    public function calendar(Request $request)
    {
        return view('models.appointments.calendar', compact('request'));
    }

    public function feed(Request $request)
    {
        // if (User::IsPatient()) {
        //     $appts = Auth::user()->patient->appointments;
        // } else {
        //     $appts = Appointment::all();
        // }

        $appts = Appointment::all();
        return $appts->toJson();
    }
}
