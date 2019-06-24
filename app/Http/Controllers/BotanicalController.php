<?php

namespace App\Http\Controllers;

use App\Botanical;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BotanicalController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.botanicals.home");        
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
     * @param  \App\Botanical  $botanical
     * @return \Illuminate\Http\Response
     */
    public function show(Botanical $botanical)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Botanical  $botanical
     * @return \Illuminate\Http\Response
     */
    public function edit(Botanical $botanical)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Botanical  $botanical
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Botanical $botanical)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Botanical  $botanical
     * @return \Illuminate\Http\Response
     */
    public function destroy(Botanical $botanical)
    {
        //
    }
}
