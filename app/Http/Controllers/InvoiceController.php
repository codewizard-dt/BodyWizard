<?php

namespace App\Http\Controllers;

use App\Invoice;
use App\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class InvoiceController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    public function create()
    {
        $type = Auth::user()->user_type;
        return view("portal.$type.invoices.create");
    }

    public function save($id, Request $request)
    {
        $invoice = ($id == 'new') ? new Invoice : Invoice::find($id);
        $apptId = $request->appointment_id;
        try{
            $appt = Appointment::findOrFail($apptId);
            $patient = $appt->patient();
            $invoice->invoiced_to_user_id = $patient->userInfo->id;
            $invoice->created_by_user_id = Auth::user()->id;
            $invoice->appointment_id = $apptId;
            $invoice->total_charge = $request->total_charge;
            $invoice->notes = $request->notes;
            $invoice->line_items = $request->line_items;
            $invoice->payments = $request->payments;
            $invoice->status = 'settled';
            $invoice->settled_at = Carbon::now();
            // $invoice->autosave = ['notes' => $request->notes, 'line_items' => $request->line_items, 'payments' => $request->payments];
            $invoice->save();
            $appt->saveToFullCal();
            setUid('Invoice',$invoice->id);
        }catch(\Exception $e){
            reportError($e,'InvoiceController 50');
        }
        return isset($e) ? $e : listReturn('checkmark');
    }

    public function autosave($id, Request $request){
        Log::info($request);
        $invoice = ($id == 'new') ? new Invoice : Invoice::find($id);
        $apptId = $request->appointment_id;
        try{
            $appt = Appointment::findOrFail($apptId);
            $patient = $appt->patient();
            $invoice->invoiced_to_user_id = $patient->userInfo->id;
            $invoice->created_by_user_id = Auth::user()->id;
            $invoice->appointment_id = $apptId;
            $invoice->total_charge = $request->total_charge;
            $invoice->status = [time()=>'pending'];
            // $invoice->notes = $request->notes;
            // $invoice->line_items = $request->line_items;
            // $invoice->payments = $request->payments;
            $invoice->autosave = ['notes' => $request->notes, 'line_items' => $request->line_items, 'payments' => $request->payments];
            $invoice->save();
            $appt->saveToFullCal();
            setUid('Invoice',$invoice->id);
        }catch(\Exception $e){
            reportError($e, 'InvoiceController 73');
        }
        return isset($e) ? $e : listReturn('checkmark');        
    }

    public function view($id)
    {
        //
    }

    public function edit($id)
    {
        //
    }

    public function update(Request $request, Invoice $invoice)
    {
        //
    }

    public function destroy(Invoice $invoice)
    {
        //
    }
}
