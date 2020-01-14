<?php

namespace App\Http\Middleware;
use Illuminate\Support\Facades\Log;

use Closure;

class CheckTabHeader
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
        $headers = getallheaders();
        if (isset($headers['X-CURRENT-TABS'])){
            $currentTabs = json_decode($headers['X-CURRENT-TABS'],true);
            $tabList = (session('CurrentTabs') == null) ? [] : session('CurrentTabs');
            foreach ($currentTabs as $menu => $tab){
                $tabList[$menu] = $tab;
            }
            session(['CurrentTabs'=>$tabList]);
        }
        if (isset($headers['X-CURRENT-UIDS']) && $headers['X-CURRENT-UIDS'] != 'null'){
            $currentUids = json_decode($headers['X-CURRENT-UIDS'],true);
            $uidList = (session('uidList') == null) ? [] : session('uidList');
            foreach ($currentUids as $model => $id){
                $uidList[$model] = $id;
            }
            session(['uidList'=>$uidList]);
        }
        return $next($request);
    }
}
