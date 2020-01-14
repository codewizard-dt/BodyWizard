<?php

namespace App\Traits;
use Illuminate\Support\Facades\Log;

trait Encryptable
{
    //
	public $nullValues = ['','[]'];

    public function encryptKms($value){
    	$type = gettype($value);
    	if ($type == 'array'){
    		$value = json_encode($value);
    	}elseif ($type != 'string'){
    		throw new Exception("Encryption -- expecting string or array... $type given");
    	}
        $kms = app("GoogleKMS");
        $practice = \App\Practice::getFromSession();
        $cryptoKey = $practice->cryptokey;
        if (in_array($value,$this->nullValues)){
        	$returnVal = null;
        }else{
	        $encryptResponse = $kms->encrypt($cryptoKey, $value);
	        $returnVal = utf8_encode($encryptResponse->getCiphertext());
        }
    	return $returnVal;
    }
    public function decryptKms($value){
        $kms = app("GoogleKMS");
        $practice = \App\Practice::getFromSession();
        $cryptoKey = $practice->cryptokey;
        if ($value == null){
        	$returnVal = null;
        }else{
			$decryptResponse = $kms->decrypt($cryptoKey,utf8_decode($value));
			if (in_array($decryptResponse->getPlaintext(),$this->nullValues)){
				$returnVal = null;
			}else{
				$json = json_decode($decryptResponse->getPlaintext(),true);
				$returnVal = $json ? $json : $decryptResponse->getPlaintext();
			}

        }
		return $returnVal;
    }
}
