<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Appointment;
use App\Practice;
use App\RefreshTables;

class RefreshAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'refresh:appointments {--factory=0}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'deletes any google cal events matching current appointments, runs migrate:refresh for appointments, and then creates dummy appointments using the existing set of patients and practitioners';

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
    public function handle()
    {
        // $service = app('GoogleCalendar');
        // $practiceId = $this->argument('practiceId');
        $apptCount = $this->option('factory');
        // $practice = Practice::find($practiceId);
        // $practice->reconnectDB();
        $practice = Practice::first();
        $calendarId = $practice->calendar_id;

        $result = $practice->clearCalendar();
        if ($result) {
            $this->info('Google calendar cleared.');
        } else {
            $this->error('Error clearing Google calendar. Refresh process canceled.');
            $this->error('Appointment database not cleared or populated.');
            $this->error('Appointments not added to Google Calendar.');
            return;
        }

        RefreshTables::clearApptTables();
        $this->info('Appointment tables cleared and feed updated.');
        $this->info('Adding ' . $apptCount . ' appointments to EHR......');
        if ($apptCount != 0) {
            RefreshTables::seedApptTables($apptCount);
            $this->info('Appointments added to EHR database.');
            $this->info('Adding appointments to Google Calendar: ' . $calendarId);
            try {
                $appointments = Appointment::all();
                foreach ($appointments as $appointment) {
                    $appointment->saveToGoogleCal("POST", $calendarId);
                }
                $this->info('Appointments added to Google Calendar.');
            } catch (\Exception $e) {
                $this->error('Error adding appointments to Google Calendar. Refresh process canceled.');
                $this->error('Event feed not updated.');
            }
        }
        RefreshTables::clearSubmissionTables();
        $this->info('Submission table cleared.');
        RefreshTables::clearChartNoteTables();
        $this->info('Chart Note table cleared.');
        RefreshTables::clearInvoiceTables();
        $this->info('Invoice table cleared.');

        setActiveStorage('Practice', $practice->practice_id);
        $practice->updateEntireEventFeed();
        $this->info('Practitioner event feed updated.');

    }
}
