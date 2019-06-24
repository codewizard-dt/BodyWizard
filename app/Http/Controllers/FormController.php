<?php

namespace App\Http\Controllers;

use App\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FormController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function home(){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.home");        
    }

    public function preview($uid){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.preview",['uid'=>$uid]);
    }

    public function settings($uid){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.settings",['uid'=>$uid]);
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
            'model'=>"Form"
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

        return view("portal.$usertype.forms.create");        
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
        // return $request->all(); 
        if ($request->form_id == "none"){
            $maxFormId = Form::orderBy('form_id','desc')->take(1)->get();
            $formId = count($maxFormId) > 0 ? $maxFormId[0]->form_id + 1 : 1;
            $versionId = 1;
            $saveAsNewVersion = true;   
        }else{
            $current = Form::find($request->form_uid);
            $formId = $request->form_id;
            $saveAsNewVersion = $current->has_submissions;
            $versionId = $saveAsNewVersion ? $current->version_id + 1 : $current->version_id;
        }
        if ($saveAsNewVersion){
            $form = new Form;
        }else{
            $form = $current;
        }
        $form->form_id = $formId;
        $form->version_id = $versionId;
        $form->form_name = $request->form_name;
        $form->questions = $request->questions;
        $form->full_json = $request->full_json;

        if ($form->save()){
            session([$form->getKeyName()=>$form->id]);
            return array($form->form_uid,$form->form_id);
        }else{
            return false;
        }
    }
    /**
     * Display the specified resource.
     *
     * @param  \App\Form  $form
     * @return \Illuminate\Http\Response
     */
    public function show(Form $form)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Form  $form
     * @return \Illuminate\Http\Response
     */
    public function edit(Form $form)
    {
        //
        $usertype = Auth::user()->user_type;

        return view("portal.$usertype.forms.create",['form'=>$form]);        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Form  $form
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Form $form)
    {
        //
        $form->questions = $request->questions;
        $form->full_json = $request->full_json;
        $form->save();
        return view('confirmations.checkmark');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Form  $form
     * @return \Illuminate\Http\Response
     */
    public function destroy(Form $form)
    {
        //
    }
}
