<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PagesController extends Controller
{
    //
    public function home(){
    	return view('index');
    }
    public function about(){
    	return view('about');
    }
    public function rates(){
    	return view('rates');
    }
    public function conditions(){
    	return view('conditions');
    }
    public function treatments(){
        return view('treatments');
    }
    public function launchpad(){
        return view('launchpad');
    }
    public function booknow(){
        return view('booknow');
    }
    public function checkmark(){
        return view('confirmations.checkmark');
    }
    public function logout(){
        return view('auth.logout');
    }
    public function headspace(){
        return view('headspace');
    }
    public function portalsettings(){
        $usertype = Auth::user()->user_type;
        return view('portal.'.$usertype.'.settings');
    }
    public function practicesettings(){
        $usertype = Auth::user()->user_type;
        return view('portal.'.$usertype.'.practice-settings');
    }
}
