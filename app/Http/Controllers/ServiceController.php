<?php

namespace App\Http\Controllers;

use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

include_once app_path('php/functions.php');

class ServiceController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.services.home");        
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $usertype = Auth::user()->user_type;

        return view("models.list",[
            'model' => "Service"
        ]);        
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
        $usertype = Auth::user()->user_type;

        return view("models.create",[
            'model' => 'Service'
        ]);        
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
        $service = new Service;
        $str = "";

        foreach(json_decode($request->columnObj,true) as $key => $value){
            $service->$key = $value;
            // $str .= "$key: $value<br>";
        }

        $service->full_json = $request->full_json;
        if ($service->save()){
            session('service_id',$service->service_id);
        }else{
            return "failure to save";
        }

        $connectedModels = json_decode($request->connectedModels,true);
        foreach($connectedModels as $model){
            $rel = $model['relationship'];
            $modelName = $model['model'];
            $class = "App\\$modelName";
            $uids = $model['uidArr'];
            foreach ($uids as $uid) {
                if ($rel == 'belongsTo'){
                    $method = strtolower($modelName);
                    $instance = $class::find($uid);
                    $service->$method()->associate($instance);
                    $service->save();
                    // return $instance->service_category_name;
                }elseif ($rel == 'morphToMany'){
                    // $method = strtolower(plural($modelName));
                    $instance = $class::find($uid);
                    $instance->services()->attach($service->getKey());
                    // return plural($modelName);
                }
            }
        }
        return "made it";
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Service  $service
     * @return \Illuminate\Http\Response
     */
    public function show(Service $service)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Service  $service
     * @return \Illuminate\Http\Response
     */
    public function edit(Service $service)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Service  $service
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Service $service)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Service  $service
     * @return \Illuminate\Http\Response
     */
    public function destroy(Service $service)
    {
        //
    }
}
