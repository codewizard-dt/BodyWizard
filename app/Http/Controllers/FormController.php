<?php

namespace App\Http\Controllers;

use App\Form;
use App\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


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
        include_once app_path("php/functions.php");

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
        // $form->questions = $request->questions;
        $dummy = ["yes"=>5];
        $form->questions = json_encode($dummy);
        // $imgs = extractEmbeddedImages($request->full_json,$form,"full_json");
        $form->full_json = $this->extractImgsFromJson($request->full_json, $form);

        if ($form->save()){
            session([$form->getKeyName()=>$form->id]);
            return array($form->form_uid,$form->form_id);
        }else{
            return false;
        }
    }

    public function extractImgsFromJson($fullJson,$form){
        $json = json_decode($fullJson,true);
        $sections = $json['sections'];
        $embeddedImgs = [];
        for ($s = 0; $s < count($sections); $s++){
            $items = $sections[$s]['items'];
            for ($i = 0; $i < count($items); $i++){
                $item = $items[$i];
                if ($item['type'] == 'narrative'){
                    $markup = $item['options']['markupStr'];
                    Log::info($markup);
                    $newImgs = preg_match_all('/src="data:([^;.]*);([^".]*)" data-filename="([^"]*)"/', $markup, $newImgMatches, PREG_PATTERN_ORDER);
                    if ($newImgs!==false && $newImgs > 0){
                        for ($x = 0; $x < count($newImgMatches[1]); $x++){
                            $uuid = uuid();
                            $fullMatch = $newImgMatches[0][$x];
                            $mimeType = $newImgMatches[1][$x];
                            $dataStr = $newImgMatches[2][$x];
                            $fileName = $newImgMatches[3][$x];
                            $embedStr = 'src="%%EMBEDDED:'.$uuid.'%%"';
                            // array_push($embeddedImgs,[$uuid,$mimeType,$fileName,$dataStr]);
                            array_push($embeddedImgs,$uuid);
                            $markup = str_replace($fullMatch,$embedStr,$markup);

                            $image = new Image;
                            $image->id = $uuid;
                            $image->mime_type = $mimeType;
                            $image->file_name = $fileName;
                            $image->data_string = $dataStr;
                            $image->save();
                          }
                    }
                    $json['sections'][$s]['items'][$i]['options']['markupStr'] = $markup;
                }
            }
        }
        $form->images()->sync($embeddedImgs);
        return json_encode($json);
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
        // $form->questions = $request->questions;
        // $form->full_json = $request->full_json;
        // $form->save();
        // return view('confirmations.checkmark');
        return false;
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
