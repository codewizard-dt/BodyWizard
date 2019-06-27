<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
}
