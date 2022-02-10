<?php

namespace App\Observers;

use App\ChartNote;
use Illuminate\Support\Facades\Log;

class ChartNoteObserver
{
    public function saving(ChartNote $note)
    {
        if ($note->signature && !$note->signed_at) {
            $dt = now();
            // logger($dt);
            $note->signed_at = $dt;
        }
    }
}
