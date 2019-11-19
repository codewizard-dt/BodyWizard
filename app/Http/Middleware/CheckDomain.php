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
        if ((session('domain') !== null && session('domain') !== $request->getHost()) ||
            (session('port') !== null && session('port') != $request->getPort()) ){
            $request->session()->invalidate();
            Auth::logout();
            return redirect('/');
        }
        return $next($request);
    }
}
