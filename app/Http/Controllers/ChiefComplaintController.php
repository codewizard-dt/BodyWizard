<?php

namespace App\Http\Controllers;

use App\ChiefComplaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChiefComplaintController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.complaints.home");        
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
     * @param  \App\ChiefComplaint  $complaint
     * @return \Illuminate\Http\Response
     */
    public function show(ChiefComplaint $complaint)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\ChiefComplaint  $complaint
     * @return \Illuminate\Http\Response
     */
    public function edit(ChiefComplaint $complaint)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\ChiefComplaint  $complaint
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ChiefComplaint $complaint)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\ChiefComplaint  $complaint
     * @return \Illuminate\Http\Response
     */
    public function destroy(ChiefComplaint $complaint)
    {
        //
    }
}
