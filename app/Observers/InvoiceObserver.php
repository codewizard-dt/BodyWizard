<?php

namespace App\Observers;
use App\Invoice;

class InvoiceObserver
{
    //
	public function saved(Invoice $invoice){
		if ($invoice->appointment) $invoice->appointment->fcal('update');
	}
}
