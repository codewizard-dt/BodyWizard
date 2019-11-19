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
        include_once app_path("/php/functions.php");
        Log::info("CREATING NEW PRACTICE AT ".now());
        $name = cleaninput($this->argument('practiceName'));
        $email = cleaninput($this->argument('email'));
        $domain = cleaninput($this->argument('domain'));
        $practiceId = uuidNoDash();
        $dbname = replacespaces(strtolower($name))."_".$practiceId;
        $dbname = substr($dbname, 0, 58)."_ehr";

        $calendarId = Practice::createCalendar($name,$email);
        if (!$calendarId){
            $this->error("Error creating calendar.");
            $this->error("Practice setup incomplete.");
            return;
        }else{
            $this->info("Calendar ($calendarId) created and shared access with $email");
        }
        $watch = Practice::watchCalendar($practiceId, $calendarId);
        if (!$watch){
            $this->error("Error creating calendar web hook.");
            $this->error("Practice setup incomplete.");
            return;
        }else{
            $this->info("Calendar web hook created (id = $watch)");
            // Log::info(var_dump($watch));
        }        

        $database = Practice::createDatabase($dbname);
        if (!$database){
            $this->error("Error creating database.");
            $this->error("Practice setup incomplete.");
            return;
        }else{
            $this->info("Database ($database) created.");
        }

        $installForms = Practice::installBasicForms($database);
        if (!$installForms){
            $this->error("Error installing basic forms.");
            $this->error("Practice setup incomplete.");
            return;
        }else{
            $this->info('Basic forms installed.');
        }

        $cryptoKey = Practice::makeCryptoKey($practiceId, $name);
        if (!$cryptoKey){
            $this->error("Error creating cryptokey.");
            $this->error("Practice setup incomplete.");
            return;
        }else{
            $this->info('Cryptokey created.');
        }

        $practiceData = 
            [
                'public' => 
                [
                    'practiceName' => $name,
                    'location' => null
                ],
                'app' => 
                [
                    'admin' => $email,
                    'database' => $database,
                    'calendarId' => $calendarId,
                    'cryptoKey' => $cryptoKey
                ]
            ];
        addToConfig('practices', $practiceId, $practiceData);
        
        if (count(explode(":",$domain)) > 1){
            $array = explode(":",$domain);
            $domain = $array[0]; 
            $port = $array[1];
            $currentPorts = (isset(config('domains')[$domain])) ? config('domains')[$domain] : [];
            $currentPorts[$port] = $practiceId;
            addToConfig('domains', $domain, $currentPorts);
        }else{
            addToConfig('domains', $domain, $practiceId);
        }
        $this->info("Config files saved.");

        $calUpdate = Practice::updateEntireEventFeed($practiceId);
        if (!$cryptoKey){
            $this->error("Error connecting to calendar.");
            $this->error("Practice setup incomplete.");
            return;
        }else{
            $this->info('Practice calendars initialized');
        }
        $this->info("Practice setup complete.");
    }
}
