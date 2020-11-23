<?php

namespace App\Http\Controllers;

// use App\Code;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CodeController extends Controller
{
  public function __construct(){
    $this->middleware('auth');
  }
  public function getIcdApiToken() {
    $endpoint = "https://icdaccessmanagement.who.int/connect/token";
    $client = new \GuzzleHttp\Client();
    $clientId = config('services.icd_api.id');
    $clientSecret = config('services.icd_api.secret');

    $response = $client->request('POST', $endpoint, ['form_params' => [
      'client_id' => $clientId,
      'client_secret' => $clientSecret,
      'scope' => 'icdapi_access',
      'grant_type' => 'client_credentials'
    ]]);

        // url will be: http://my.domain.com/test.php?key1=5&key2=ABC;

    $statusCode = $response->getStatusCode();
    $content = $response->getBody();
    $json = json_decode($content,true);
    Log::info(json_decode($content,true));
    return ['token'=>$json['access_token']];
  }
}
