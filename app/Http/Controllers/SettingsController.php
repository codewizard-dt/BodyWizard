<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class SettingsController extends Controller
{
    //
    public function __construct(){
    	$this->middleware('auth');
    }
    public function userSettings(){
        return view('portal.user.settings');
    }
    public function userInfo(){
    	return view('portal.user.info');
    }
    public function settingsHome(){
        return view('portal.'.Auth::user()->user_type.'.settings');
    }
    public function panel(){
        return view('portal.'.Auth::user()->user_type.'.settings.panel');
    }
    public function displaySettings($model, Request $request){
        $models = plural(camel($model));
        return view('portal.'.camel(Auth::user()->user_type).'.settings.display.'.$models);
    }
    public function displayOrderUpdate(Request $request){
        try{
            foreach ($request->all() as $model => $instances){
                $class = "App\\$model";
                foreach ($instances as $uid => $order){
                    $instance = $class::find($uid);
                    $instance->display_order = $order;
                    $instance->save();
                }
            }
        }catch(\Exception $e){
            Log::$e;
        }

        return isset($e) ? $e : "checkmark";
    }
    public function password(){
    	return view('portal.user.password');
    }
    public function changePw(Request $request){
    	$id = Auth::user()->id;
    	$user = User::find($id);
    	if (!Hash::check($request->old_password, Auth::user()->password)){
    		return "mismatch";
    	}elseif (Hash::check($request->new_password, Auth::user()->password)){
    		return "no changes";
    	}else{
    		$newHash = Hash::make($request->new_password);
    		$changes = [
    			'password' => [
    				'old' => $user->password,
    				'new' => $newHash
    			]
    		];
    		$user->password = $newHash;
            $user->require_new_pw = 0;
    		try{
	    		$user->save();
	    		$user->saveTrackingInfo($user, $changes, $request->getClientIp());
	    		return "checkmark";
    		}catch(\Exception $e){
    			Log::info($e);
    			return $e;
    		}
    	}
    }
    public function checkPw(Request $request){
    	$id = Auth::user()->id;
    	$user = User::find($id);
    	if (!Hash::check($request->password, Auth::user()->password)){
    		return "mismatch";
    	}elseif (Hash::check($request->password, Auth::user()->password)){
    		return "checkmark";
    	}
    }
    public function updateSecQ(Request $request){
        $id = Auth::user()->id;
        $user = User::find($id);
        // Log::info($request->all());
        // return $request->all();
        $questions = json_decode($request->questions,true);
        foreach ($questions as $q => $a){
            $aHash = Hash::make($a);
            $questions[$q] = $aHash;
        }
        if (Auth::user()->security_questions != null && $questions == Auth::user()->security_questions){
            return "no changes";
        }else{
            $changes = [
                'security_questions' => [
                    'old' => $user->security_questions,
                    'new' => $questions
                ]
            ];
            $user->security_questions = $questions;
            try{
                $user->save();
                $user->saveTrackingInfo($user, $changes, $request->getClientIp());
                return "checkmark";
            }catch(\Exception $e){
                Log::info($e);
                return $e;
            }
        }
    }
    public function changeSecQuestions(){
    	return view('auth.security-questions.change');
    }
    public function securityQuestions(){
    	return view('portal.user.security-questions');
    }
}
