<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;

class StripeController extends Controller
{
    public function getPaymentIntent($userId, Request $request){
    	$user = User::find($userId);
    	try{
    		$options = $request->intent_options;
    		$options['customer'] = $user->stripe_id;

			$intent = \Stripe\PaymentIntent::create($options);
    	}catch(\Exception $e){
    		reportError($e,'StripeController 18');
    	}
    	return isset($e) ? $e : [
    		'client_secret'=>$intent->client_secret,
    		'user_id'=>$user->id,
    		'stripe_id'=>$user->stripe_id
    	];
    }
}
