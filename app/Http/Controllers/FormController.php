<?php

namespace App\Http\Controllers;

use App\Form;
use App\Image;
use App\Submission;
use App\Appointment;
use App\Patient;
use App\Events\BugReported;
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

    public function submit($uid, Request $request){
        $usertype = Auth::user()->user_type;
        $patientId = ($usertype == 'patient') ? Auth::user()->patientInfo->id : session('uidList')['Patient'];
        $patient = Patient::find($patientId);
        $userId = Auth::user()->id;
        $submission = new Submission;
        $form = Form::find($uid);
        $apptId = (session('uidList') !== null && isset(session('uidList')['Appointment'])) ? session('uidList')['Appointment'] : null;
        if ($apptId){
            if (!Appointment::find($apptId)->requiresForm($form->form_id, $usertype)){
                $apptId = null;
            }
        }
        if (!$apptId){
            $appt = Appointment::firstThatNeedsForm($form->form_id, $patientId);
            if ($appt){
                $apptId = $appt->id;
            }
        }
        
        try{
            $submission->patient_id = $patientId;
            $submission->submitted_by_user_id = $userId;
            $submission->self_submitted = ($patient->userInfo->id == $userId);
            $submission->submitted_by = $usertype;
            $submission->appointment_id = $apptId;
            $submission->form_uid = $uid;
            $submission->form_id = $form->form_id;
            $submission->form_name = $form->form_name;
            $submission->responses = $request->jsonObj;
            $submission->save();
            $form->has_submissions = true;
            $form->save();
            if ($apptId){
                $appt = Appointment::find($apptId)->saveToFullCal();
            }
            if (isset($request->columnObj)){
                $model = $request->model;
                $modelUid = $request->uid;
                $columns = $request->columnObj;
                $this->storeColumns($model, $modelUid, $columns, $request);
            }
            return "checkmark";
        }catch(\Exception $e){
            event(new BugReported(
                [
                    'description' => "Error Saving Submission", 
                    'details' => $e, 
                    'category' => 'Submissions', 
                    'location' => 'FormController.php',
                    'user' => null
                ]
            ));
            return $e;
        }
    }
    public function storeColumns($model, $uid, $columnObj, Request $request){
        $class = "App\\$model";
        $instance = $class::find($uid);
        $trackChanges = usesTrait($instance,"TrackChanges");

        if ($trackChanges){
            $includeFullJson = isset($instance->auditOptions['includeFullJson']) ? $instance->auditOptions['includeFullJson'] : false;
            $changes = $instance->checkForChanges($instance,$request,$includeFullJson);
        }
        foreach ($columnObj as $column => $value){
            $instance->$column = $value;
        }
        $instance->save();
        if ($trackChanges && $changes){
            $instance->saveTrackingInfo($instance, $changes, $request->getClientIp());
        }
    }

    public function index()
    {
        //
        $usertype = Auth::user()->user_type;

        return view("models.list",[
            'model'=>"Form"
        ]);        
    }

    public function create()
    {
        //
        $usertype = Auth::user()->user_type;

        return view("portal.$usertype.forms.create");        
    }

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
            if (isset($current)){
                $form->settings = $current->settings;
                $form->settings_json = $current->settings_json;
                $current->current = false;
                $current->save();
            }else{
                $form->settings = Form::defaultSettings();
            }
        }else{
            $form = $current;
        }

        $form->form_id = $formId;
        $form->version_id = $versionId;
        $form->form_name = $request->form_name;
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
                    $newImgs = preg_match_all('/src="data:([^;.]*);([^".]*)" data-filename="([^"]*)"/', $markup, $newImgMatches, PREG_PATTERN_ORDER);
                    $oldImgs = preg_match_all('/src="data:([^;.]*);([^".]*)" data-uuid="([^"]*)" data-filename="([^"]*)"/', $markup, $oldImgMatches, PREG_PATTERN_ORDER);

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
                    if ($oldImgs!==false && $oldImgs > 0){
                        for ($x = 0; $x < count($oldImgMatches[1]); $x++){
                            $fullMatch = $oldImgMatches[0][$x];
                            $uuid = $oldImgMatches[3][$x];
                            $embedStr = 'src="%%EMBEDDED:'.$uuid.'%%"';
                            $markup = str_replace($fullMatch,$embedStr,$markup);
                            array_push($embeddedImgs, $uuid);
                        }
                    }
                    $json['sections'][$s]['items'][$i]['options']['markupStr'] = $markup;
                }
            }
        }
        $form->images()->sync($embeddedImgs);
        return json_encode($json);
    }
    public function checkNarrativeImgs(Request $request){
        $ctrl = new Form;
        return $ctrl->narrative($request);
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
