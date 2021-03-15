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
        if (Auth::user() && !getUid('Practice')){
            $practice = Practice::getFromRequest($request);
            setUid('Practice',$practice->practice_id);
        }
        return $next($request);
    }
}
