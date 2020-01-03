<?php

namespace App\Listeners;

use App\Events\BugReported;
use App\Notifications\BugReport;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;

class SendBugReport
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  BugReported  $event
     * @return void
     */
    public function handle(BugReported $event)
    {
        $bug = new \App\Bug;
        $bug->description = title($event->description);
        $bug->details = $event->details;
        $bug->location = $event->location;
        $bug->category = title($event->category);
        $bug->user_id = $event->user ? $user->id : null;
        $bug->status = ['opened' => Carbon::now()->timestamp];
        $bug->save();
        $users = \App\User::admins();
        Notification::send($users, new BugReport($bug));
    }
}