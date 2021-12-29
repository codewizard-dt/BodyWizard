<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PagesController extends Controller
{
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
  public function logout(){
    session()->forget('usertype');
    Auth::logout();
    return view('auth.login', ['logout' => true]);
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
  public function setRole(Request $request){
    $role = $request->selected_role;
    session(['usertype' => $role]);
    if ($request->options['save_as_default'] == 'true'){
      Log::info("SET IT YO");
      // User::find(Auth::)
      Auth::user()->update(['roles->default' => $role]);
    }
  }
}
