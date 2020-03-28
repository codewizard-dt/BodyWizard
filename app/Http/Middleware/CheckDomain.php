<?php

namespace App\Http\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Auth;
use App\Practice;

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
        if (Auth::user() && session('practiceId') === null){
            if (session('practiceId') === null){
                $practice = Practice::getFromRequest($request);
                session([
                    'domain' => $practice->host,
                    'practiceId' => $practice->practice_id,
                    'calendarId' => $practice->calendar_id,
                    'timezone' => $practice->contact_info['timezone']
                ]);
                date_default_timezone_set($practice->contact_info['timezone']);
            }
        }
        return $next($request);
    }
}
