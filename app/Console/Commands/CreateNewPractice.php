<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Practice;

class CreateNewPractice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:practice {practiceName} {email} {domain}';

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
        Log::info("CREATING NEW PRACTICE AT ".now());
        $practiceName = cleaninput($this->argument('practiceName'));
        $email = cleaninput($this->argument('email'));
        $domain = cleaninput($this->argument('domain'));
        // $practiceId = uuidNoDash();
        $shortName = substr($practiceName, 0, 24);
        $dbname = replacespaces(strtolower($shortName))."_".uuidNoDash();
        $dbname = substr($dbname, 0, 44)."_ehr";

        $practice = new Practice;
        $practice->host = $domain;
        $practice->practice_id = substr($dbname, 0, 36);
        $practice->name = $practiceName;

        //CREATES CALENDAR
            try{
                $calendarId = $practice->createCalendar($practiceName);
                $practice->calendar_id = $calendarId;
                $practice->shareCalendar($email);
                $this->info("Calendar ($calendarId) created and shared access with $email");
            }catch(Exception $e){
                $this->error($e);
                $this->error("Error creating calendar.");
                $this->error("Practice setup aborted.");
                return;
            }

        //CREATES CALENDAR WEBHOOK
            try{
                $watch = $practice->newCalWebHook();
                if (is_a($watch,'Exception')){
                    $this->error($watch);
                    $this->error('Error setting up webhook');
                    $this->error("Practice setup aborted.");
                    return;
                }else{
                    $practice->cal_webhook = $watch;
                    $this->info("Calendar web hook created (id = ".$watch['id'].")");                
                }
            }catch(Exception $e){
                $this->error($e);
                $this->error("Error creating webhook.");
                $this->error("Practice setup aborted.");
                return;
            }

        //CREATES DATABASE
            try{
                $dbresult = $practice->createDatabase($dbname);
                if ($dbresult === true){
                    $practice->dbname = $dbname;
                    $this->info("Database ($dbname) created.");
                }else{
                    $this->error($dbresult);
                    $this->error('Error setting up database');
                    $this->error("Practice setup aborted.");
                    return;
                }
            }catch(Exception $e){
                $this->error($e);
                $this->error("Error creating database.");
                $this->error("Practice setup aborted.");
                return;
            }

        //CREATES DEFAULT USERS
            try{
                $practice->refreshUsers();
                $this->info("Default users created");
            }catch(Exception $e){
                $this->error($e);
                $this->error("Error creating database.");
                $this->error("Practice setup aborted.");
                return;
            }

        //INSTALLS SYSTEM FORMS
            try{
                $result = $practice->installBasicForms();
                if ($result === true){
                    $this->info('Basic forms installed.');
                }else{
                    $this->error($result);
                    $this->error("Error installing basic forms.");
                    $this->error("Practice setup aborted.");
                    return;
                }
            }catch(Exception $e){
                $this->error($e);
                $this->error("Error installing basic forms.");
                $this->error("Practice setup aborted.");
                return;
            }

        //CREATES CRYPTOKEY
            try{
                $keyName = $practice->makeCryptoKey();
                if (is_a($keyName,'Exception')){
                    $this->error($keyName);
                    $this->error('Error setting up cryptokey.');
                    $this->error("Practice setup aborted.");
                    return;
                }else{
                    $practice->cryptokey = $keyName;
                    $this->info("Cryptokey created: $keyName");
                }
            }catch(Exception $e){
                $this->error($e);
                $this->error("Error creating cryptokey.");
                $this->error("Practice setup aborted.");
                return;
            }

        $contactInfo = [
            'practiceName' => $practiceName,
            'location' => null,
            'timezone' => 'America/Chicago',
            'phone numbers' => null
        ];
        $practice->contact_info = $contactInfo;

        // $practiceData = 
        //     [
        //         'public' => 
        //         [
        //             'practiceName' => $practiceName,
        //             'location' => null,
        //             'timezone' => 'America/Chicago'
        //         ],
        //         'app' => 
        //         [
        //             'status' => 'active',
        //             'admin' => $email,
        //             'database' => $database,
        //             'calendarId' => $calendarId,
        //             'cryptoKey' => $cryptoKey,
        //             'webhooks' => ['calendar' => $watch]
        //         ]
        //     ];
        // addToConfig('practices', $practiceId, $practiceData);
        
            // if (count(explode(":",$domain)) > 1){
            //     $array = explode(":",$domain);
            //     $domain = $array[0]; 
            //     $port = $array[1];
            //     // $currentPorts = (isset(config('domains')[$domain])) ? config('domains')[$domain] : [];
            //     $currentPorts[$port] = $practiceId;
            //     addToConfig('domains', $domain, $currentPorts);
            // }else{
            //     addToConfig('domains', $domain, $practiceId);
            // }

        // $calUpdate = Practice::updateEntireEventFeed($practiceId);
        // if (!$calUpdate){
        //     $this->error("Error connecting to calendar.");
        //     $this->error("Practice setup incomplete.");
        //     return;
        // }else{
        //     $this->info('Practice calendars initialized');
        // }

        try{
            $result = $practice->updateEntireEventFeed();
            if ($result === true){
                $this->info('Practice calendars initialized');
            }else{
                $this->error($result);
                $this->error("Error connecting to calendar.");
                $this->error("Practice setup aborted.");
                return;
            }
        }catch(Exception $e){
            $this->error($e);
            $this->error("Error connecting to calendar.");
            $this->error("Practice setup aborted.");
            return;
        }

        // Log::info($pr)

        $this->info("Practice setup complete!");
    }
}
