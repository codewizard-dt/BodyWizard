<?php

namespace App\Http\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Auth;

use Closure;

class CheckDomain
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // Log::info($request->getHost(),['location'=>'checkdomain.php 21']);
        // Log::info(session()->all(),['location'=>'checkdomain.php 22']);

        if (Auth::user()){
            if (session('practiceId') === null){
                $host = $request->getHost();
                $port = $request->getPort();
                $practiceId = getPracticeId($request);
                $calendarId = practiceConfig("practices.$practiceId.app.calendarId");
                $tz = practiceConfig("practices.$practiceId.public.timezone");
                Log::info('checkdomain',[
                    'host' => $host,
                    'port' => $port,
                    'practiceId' => $practiceId,
                    'calendarId' => $calendarId,
                    'tz' => $tz
                ]);
                date_default_timezone_set($tz);
                session([
                    'domain' => $host,
                    'port' => $port,
                    'practiceId' => $practiceId,
                    'calendarId' => $calendarId,
                    'timezone' => $tz
                ]);
                // Log::info("HEY",['location'=>'checkdomain.php 39']);
                // Log::info(session()->all(),['location'=>'checkdomain.php 39']);
            }else{
                date_default_timezone_set(session('timezone'));
            }
        }
        if ((session('domain') !== null && session('domain') !== $request->getHost()) ||
            (session('port') !== null && session('port') != $request->getPort()) ){
            $request->session()->invalidate();
            Auth::logout();
            return redirect('/');
        }
        return $next($request);
    }
}
