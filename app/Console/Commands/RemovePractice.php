<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;


class RemovePractice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'practice:remove {practiceId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Removes the practice entirely, deletes database, deletes calendar';

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
        // include_once app_path("/php/functions.php");
        $practiceId = $this->argument('practiceId');
        $practice = config("practices.$practiceId.app");
        $db = $practice['database'];
        $calId = $practice['calendarId'];
        // REMOVE DATABASE
            try{
                $client = app('GoogleClient');
                $client->addScope("https://www.googleapis.com/auth/sqlservice.admin");
                $service = new \Google_Service_SQLAdmin($client);
                $project = config('google.project_id');
                $instance = config('google.sql_instance');
                $service->databases->delete($project, $instance, $db);
            }catch(\Exception $eDB){
                Log::error($eDB);
            }
            if (isset($eDB)){$this->error('Database not deleted');}
            else{$this->info('Database deleted');}
        // REMOVE CALENDAR
            try{
                app('GoogleCalendar')->calendars->delete($calId);
            }catch(\Exception $eCal){
                Log::error($eCal);
            }
            if (isset($eCal)){$this->error('Calendar not deleted');}
            else{$this->info('Calendar deleted');}
        // REMOVE FROM CONFIG
            try{
                $practices = config('practices');
                unset($practices[$practiceId]);
                $fileName = 'practices.php';
                writeConfig($practices,$fileName);
            }catch(\Exception $eConfig){
                Log::error($eConfig);
            }
            if (isset($eConfig)){$this->error('Practice config not removed');}
            else{$this->info('Practice config removed');}
        if (!isset($eDB) && !isset($eCal) && !isset($eConfig)){$this->info('Practice fully removed');}
        else{$this->error("Practice not fully removed");}
    }
}
