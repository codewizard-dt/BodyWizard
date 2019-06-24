<?php

namespace App\Http\Controllers;

use App\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.messages.home");        
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function send()
    {
        $client = app('GoogleClient');
        return dd($client);
    }

}
