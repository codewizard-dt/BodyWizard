<?php

namespace App\Http\Controllers;

use App\TreatmentPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TreatmentPlanController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.treatment_plans.home");        
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
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
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\TreatmentPlan  $treatmentPlan
     * @return \Illuminate\Http\Response
     */
    public function show(TreatmentPlan $treatmentPlan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\TreatmentPlan  $treatmentPlan
     * @return \Illuminate\Http\Response
     */
    public function edit(TreatmentPlan $treatmentPlan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\TreatmentPlan  $treatmentPlan
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, TreatmentPlan $treatmentPlan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\TreatmentPlan  $treatmentPlan
     * @return \Illuminate\Http\Response
     */
    public function destroy(TreatmentPlan $treatmentPlan)
    {
        //
    }
}
