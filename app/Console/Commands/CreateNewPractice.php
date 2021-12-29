<?php

namespace App\Console\Commands;

use App\Practice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CreateNewPractice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:practice {practiceName}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates a new practice with UUID';

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
        Log::info("CREATING NEW PRACTICE AT " . now());
        $practiceName = cleaninput($this->argument('practiceName'));
        // $email = cleaninput($this->argument('email'));
        // $domain = cleaninput($this->argument('domain'));
        // $practiceId = uuidNoDash();
        $shortName = substr($practiceName, 0, 24);
        $dbname = replacespaces(strtolower($shortName)) . "_" . uuidNoDash();
        // $dbname = substr($dbname, 0, 44)."_ehr";

        $practice = new Practice;
        // $practice->host = $domain;
        // $practice->practice_id = substr($dbname, 0, 36);
        $practice->name = $practiceName;
        $practice->save();

        //CREATES DEFAULT USERS
        try {
            $practice->refreshUsers();
            $this->info("Default users created");
        } catch (\Exception $e) {
            $this->error($e);
            $this->error("Error creating database.");
            $this->error("Practice setup aborted.");
            return;
        }

        //INSTALLS SYSTEM FORMS
        try {
            $result = $practice->installBasicForms();
            if ($result === true) {
                $this->info('Basic forms installed.');
            } else {
                $this->error($result);
                $this->error("Error installing basic forms.");
                $this->error("Practice setup aborted.");
                return;
            }
        } catch (\Exception $e) {
            $this->error($e);
            $this->error("Error installing basic forms.");
            $this->error("Practice setup aborted.");
            return;
        }

        // //CREATES CRYPTOKEY
        //     try{
        //         $keyName = $practice->makeCryptoKey();
        //         if (is_a($keyName,'Exception')){
        //             $this->error($keyName);
        //             $this->error('Error setting up cryptokey.');
        //             $this->error("Practice setup aborted.");
        //             return;
        //         }else{
        //             $practice->cryptokey = $keyName;
        //             $this->info("Cryptokey created: $keyName");
        //         }
        //     }catch(\Exception $e){
        //         $this->error($e);
        //         $this->error("Error creating cryptokey.");
        //         $this->error("Practice setup aborted.");
        //         return;
        //     }

        $contactInfo = [
            'practiceName' => $practiceName,
            'location' => null,
            'timezone' => 'America/Chicago',
            'phone numbers' => null,
        ];
        $practice->contact_info = $contactInfo;

        try {
            $result = $practice->updateEntireEventFeed();
            if ($result === true) {
                $this->info('Practice calendars initialized');
            } else {
                $this->error($result);
                $this->error("Error connecting to calendar.");
                $this->error("Practice setup aborted.");
                return;
            }
        } catch (\Exception $e) {
            $this->error($e);
            $this->error("Error connecting to calendar.");
            $this->error("Practice setup aborted.");
            return;
        }

        // Log::info($pr)

        $this->info("Practice setup complete!");
    }
}
