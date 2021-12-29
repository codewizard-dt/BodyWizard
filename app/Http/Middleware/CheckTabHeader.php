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
        try {
            if (isset($headers['X-Current-Tabs']) && strpos($request->path(),'artisan') === false){
                $currentTabs = json_decode($headers['X-Current-Tabs'],true);
                // logger(compact('currentTabs'));
                $tabList = (session('CurrentTabs') == null) ? [] : session('CurrentTabs');
                foreach ($currentTabs as $menu => $tab){
                    $tabList[$menu] = $tab;
                }
                session(['CurrentTabs'=>$tabList]);
            }
            if (isset($headers['X-Current-Uids']) && $headers['X-Current-Uids'] != 'null'){
                $currentUids = json_decode($headers['X-Current-Uids'],true);
                if (empty($currentUids)) {
                    $uidList = null;
                }else{
                    $uidList = (session('uidList') == null) ? [] : session('uidList');
                    foreach ($currentUids as $model => $id){
                        $uidList[$model] = $id;
                    }
                }
                $uidList = (session('uidList') == null) ? [] : session('uidList');
                foreach ($currentUids as $model => $id){
                    $uidList[$model] = $id;
                }
                session(['uidList'=>$uidList]);
            }

        } catch (\Exception $e) {
            $error = handleError($e);
            logger(compact('headers'));
        }
        return $next($request);
    }
}
