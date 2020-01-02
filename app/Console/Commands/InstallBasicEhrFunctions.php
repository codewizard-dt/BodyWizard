<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;


class InstallBasicEhrFunctions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ehr:basics {practiceId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Installs forms and basic EHR functions';

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
        $practiceId = $this->argument('practiceId');
        $practice = practiceConfig('practices')[$practiceId];
        $db = $practice['app']['database'];
        if (installBasicForms($db)){
            $this->info('Basic Forms installed');
        }else{
            $this->error('Error installing forms');
        }
    }
}
