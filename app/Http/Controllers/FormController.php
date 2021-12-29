<?php

namespace App\Http\Controllers;

use App\Form;
use App\User;
use App\Image;
use App\Submission;
use App\Appointment;
use App\Patient;
use App\Events\BugReported;
use App\Notifications\NewSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class FormController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.home");        
    }

    public function get_html(Form $form, Request $request){
        // Log::info($form);
        try{
            return view("layouts.forms.display.form", compact('form','request'));
        }catch(\Exception $e){
            $error = handleError($e,'FormController get_html');
            return compact('error');
        }
    }
    public function get_html_preview(Form $form, Request $request) {
        try{
            $mode = 'preview';
            return view("layouts.forms.display.form", compact('form','request','mode'));
        }catch(\Exception $e){
            $error = handleError($e,'FormController get_html_preview');
            return compact('error');
        }
    }

    public function settings($uid){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.settings",['uid'=>$uid]);
    }

    public function index()
    {
        //
        $usertype = Auth::user()->user_type;

        return view("models.list",[
            'model'=>"Form"
        ]);        
    }

    public function create()
    {
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.create");        
    }


    public function edit(Form $form = null)
    {
        $usertype = Auth::user()->user_type;
        try {
            $uid = getUid('Form');
            $form = Form::findOrFail($uid);
        } catch (\Exception $e) {
            $error = handleError($e,'scriptcontroller save 100');
        }
        return isset($error) ? compact('error') : view("portal.$usertype.forms.create",['form'=>$form]);        
    }

}
