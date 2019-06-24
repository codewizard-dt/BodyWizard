<?php

namespace App\Http\Controllers;

use App\Code;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CodeController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.codes.home");        
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
            'model' => "Code"
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
        return view("portal.$usertype.codes.create");        
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
        $code = new Code;
        $code->code_name = $request->code_name;
        $code->code_description = $request->code_description;
        $code->code_type = $request->code_type;
        $code->key_words = $request->key_words;
        $code->full_json = $request->full_json;
        if ($request->has('icd_version')) {
            $code->icd_version = $request->icd_version;
        }

        if ($code->save()){
            return "checkmark";
        }else{
            return "fail";
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Code  $code
     * @return \Illuminate\Http\Response
     */
    public function show(Code $code)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Code  $code
     * @return \Illuminate\Http\Response
     */
    public function edit(Code $code)
    {
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.codes.create",['code'=>$code]);        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Code  $code
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Code $code)
    {
        //
        $code->code_name = $request->code_name;
        $code->code_description = $request->code_description;
        $code->code_type = $request->code_type;
        $code->key_words = $request->key_words;
        $code->full_json = $request->full_json;
        if ($request->has('icd_version')) {
            $code->icd_version = $request->icd_version;
        }

        if ($code->save()){
            return "checkmark";
        }else{
            return "fail";
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Code  $code
     * @return \Illuminate\Http\Response
     */
    public function destroy(Code $code)
    {
        //
    }
}
