<?php

namespace App\Http\Controllers;

use App\Form;
use App\User;
use App\Image;
use App\Submission;
use App\Appointment;
use App\Patient;
use App\Events\BugReported;
use App\Notifications\NewSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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

    public function get_html(Form $form, Request $request){
        // Log::info($form);
        try{
            return view("layouts.forms.display.form", compact('form','request'));
        }catch(\Exception $e){
            $error = handleError($e,'FormController get_html');
            return compact('error');
        }
    }
    public function get_html_preview(Form $form, Request $request) {
        try{
            $mode = 'preview';
            return view("layouts.forms.display.form", compact('form','request','mode'));
        }catch(\Exception $e){
            $error = handleError($e,'FormController get_html_preview');
            return compact('error');
        }
    }

    public function settings($uid){
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.settings",['uid'=>$uid]);
    }

    public function submit($uid, Request $request){
        $usertype = Auth::user()->user_type;
        $patientId = ($usertype == 'patient') ? Auth::user()->patient->id : session('uidList')['Patient'];
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
            $submission->self_submitted = ($patient->user->id == $userId);
            $submission->submitted_by = $usertype;
            $submission->appointment_id = $apptId;
            $submission->form_uid = $uid;
            $submission->form_id = $form->form_id;
            $submission->form_user_type = $form->user_type;
            $submission->form_name = $form->form_name;
            $submission->responses = $request->jsonObj;
            $submission->save();
            setUid("Submission",$submission->id);
            // Log::info("\n\n $apptId");
            if ($apptId){
                $appt = Appointment::find($apptId);
                $appt->saveToFullCal();
                $users = $appt->practitioner->user;
            }else{
                $users = User::where('user_type','practitioner')->get();
            }
            if ($patient->user->id == $userId){
                // $user->notify(new NewSubmission($submission));
                Notification::send($users, new NewSubmission($submission));
            }
            // $form->has_submissions = true;
            // $form->save();
            if (isset($request->columnObj)){
                $model = $request->model;
                $modelUid = $request->uid;
                $columns = $request->columnObj;
                $this->storeColumns($model, $modelUid, $columns, $request);
            }
            $response = listReturn("checkmark");
        }catch(\Exception $e){
            reportError($e,'FormController 95');
            $response = 'error';
        }
        return $response;
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
        $usertype = Auth::user()->user_type;
        return view("portal.$usertype.forms.create");        
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

    public function edit(Form $form = null)
    {
        $usertype = Auth::user()->user_type;
        try {
            $uid = getUid('Form');
            $form = Form::findOrFail($uid);
        } catch (\Exception $e) {
            $error = handleError($e,'scriptcontroller save 100');
        }
        return isset($error) ? compact('error') : view("portal.$usertype.forms.create",['form'=>$form]);        
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
