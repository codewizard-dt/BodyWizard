<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SecurityController extends Controller
{
  public function __construct()
  {
      $this->middleware('guest')->except('logout');
  }

  // public function logout
}
