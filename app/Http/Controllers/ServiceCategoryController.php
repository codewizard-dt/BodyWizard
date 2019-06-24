<?php

namespace App\Http\Controllers;

use App\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServiceCategoryController extends Controller
{

    public function __construct(){
        $this->middleware('auth');
    }

    public function home()
    {
        //
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.service_categories.home");        
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
        return view("portal.$usertype.service_categories.display.list");        
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
        return view("portal.$usertype.service_categories.create");        
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
        $category = new ServiceCategory;
        // return $request;
        $category->description = $request->description;
        $category->name = $request->name;
        $category->full_json = $request->full_json;
        unset($category->optionsNavValues);
        // return $category;
        try{
            $category->save();
            return "checkmark";
        }
        catch(\Exception $e){
            return $e;
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\ServiceCategory  $serviceCategory
     * @return \Illuminate\Http\Response
     */
    public function show(ServiceCategory $serviceCategory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\ServiceCategory  $serviceCategory
     * @return \Illuminate\Http\Response
     */
    public function edit(ServiceCategory $serviceCategory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\ServiceCategory  $serviceCategory
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ServiceCategory $serviceCategory)
    {
        //
        $category = $serviceCategory;
        $category->description = $request->description;
        $category->service_category_name = $request->service_category_name;
        $category->full_json = $request->full_json;
        // return $request;
        try{
            $category->save();
            return "checkmark";
        }
        catch(\Exception $e){
            return $e;
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\ServiceCategory  $serviceCategory
     * @return \Illuminate\Http\Response
     */
    public function destroy(ServiceCategory $serviceCategory)
    {
        //
    }
}
