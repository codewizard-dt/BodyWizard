<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;

class StripeController extends Controller
{
    public function getPaymentIntent($userId, $invoiceId, Request $request){
    	
    	try{
    	    $user = User::find($userId);
            $invoice = ($invocieId == 'new') ? new Invoice : Invoice::find($invoiceId);
        	$options = $request->intent_options;
    		$options['customer'] = $user->stripe_id;
            $options['setup_future_usage'] = isset($request->setup_future_usage) ? $request->setup_future_usage : 'off_session';
			$intent = \Stripe\PaymentIntent::create($options);
            $invoice->stripe_payment_intent_id = $intent->id;
            $invoice->save();
            setUid('Invoice',$invoice->id);
    	}catch(\Exception $e){
    		reportError($e,'StripeController 18');
    	}
    	return isset($e) ? listReturn($e) : listReturn([
                    'client_secret'=>$intent->client_secret,
                    'user_id'=>$user->id,
                    'stripe_id'=>$user->stripe_id,
                ]);
    }
}
