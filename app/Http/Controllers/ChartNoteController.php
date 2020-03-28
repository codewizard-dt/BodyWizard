<?php

namespace App\Http\Controllers;

use App\ChartNote;
use App\Form;
use App\Appointment;
use App\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChartNoteController extends Controller
{

    public function create()
    {
        return view('portal.practitioner.chart_notes.create');
    }

    public function loadForm($formId){
        $form = Form::getActiveVersion($formId);
        return view('portal.practitioner.chart_notes.chart-form',['form'=>$form]);
    }

    public function autosave($id, Request $request){
        $chartNote = ($id == 'new') ? new ChartNote : ChartNote::find($id);
        $apptId = $request->appointment_id;
        $appt = Appointment::find($apptId);
        $patient = $appt->patients->first();
        try{
            $chartNote->patient_id = $patient->id;
            $chartNote->practitioner_id = Auth::user()->practitionerInfo->id;
            $chartNote->appointment_id = $appt->id;
            $chartNote->autosave = $request->submissions;
            $chartNote->save();
            $appt->saveToFullCal();
            setUid('ChartNote',$chartNote->id);
        }catch(\Exception $e){
            reportError($e,'ChartNoteController 39');
        }
        return isset($e) ? $e : listReturn('checkmark');        
    }

    public function sign($id, Request $request){
        $chartNote = ($id == 'new') ? new ChartNote : ChartNote::find($id);
        $apptId = $request->appointment_id;
        $appt = Appointment::find($apptId);
        $patient = $appt->patients->first();
        $submissions = $request->submissions;
        $signature = $request->signature;
        $submissionIds = [];

        try{
            foreach ($submissions as $formId => $responses){
                $form = Form::find($formId);
                $submission = new Submission;
                $submission->responses = $responses;
                $submission->form_uid = $form->form_uid;
                $submission->form_id = $form->form_id;
                $submission->form_name = $form->form_name;
                $submission->patient_id = $patient->id;
                $submission->appointment_id = $appt->id;
                $submission->self_submitted = false;
                $submission->submitted_by = 'practitioner';
                $submission->submitted_by_user_id = Auth::user()->id;
                $submission->save();
                $submissionIds[] = $submission->id;
            }
            $chartNote->patient_id = $patient->id;
            $chartNote->practitioner_id = Auth::user()->practitionerInfo->id;
            $chartNote->appointment_id = $appt->id;
            $chartNote->signature = $signature;
            $chartNote->signed_at = time();
            // $chartNote->autosave = null;
            $chartNote->save();
            $chartNote->trackableSync('submissions',$submissionIds);
            // $chartNote->submissions()->sync($submissionIds);
            $appt->saveToFullCal();
            setUid('ChartNote',$chartNote->id);
        }catch(\Exception $e){
            reportError($e,'ChartNoteController 81');
        }
        return isset($e) ? $e : listReturn('checkmark');
    }
    public function view($id){
        $note = ChartNote::find($id);
        return view('portal.practitioner.chart_notes.view',['note'=>$note]);
    }
    public function edit($id){
        $apptId = ChartNote::find($id)->appointment->id;
        return view('portal.practitioner.chart_notes.edit',['apptId'=>$apptId]);
    }
    
}
