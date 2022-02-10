<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Appointment;
use App\Practice;
use App\RefreshTables;

class ClearAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clear:appointments {practiceId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clears appointments from Google Calendar and Database';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle(RefreshTables $refresh)
    {
        //
        // $practiceId = $this->argument('practiceId');
        // // $calendarId = config('practices')[$practiceId]['app']['calendarId'];
        // // $database = config('practices')[$practiceId]['app']['database'];
        // $calendarId = practiceConfig("practices.$practiceId.app.calendarId");
        // $database = practiceConfig("practices.$practiceId.app.database");
        // // $ctrl = new Appointment;
        // config(['database.connections.mysql.database' => $database]);
        // \DB::reconnect();

        // $refresh->clearApptTables();
        // $this->info('Appointment tables cleared');

        // Practice::clearCalendar($calendarId);
        // $this->info('Google calendar cleared.');
        // Practice::updateEntireEventFeed($practiceId,$calendarId);
        // $this->info('Practitioner event feed updated.');
    }
}
