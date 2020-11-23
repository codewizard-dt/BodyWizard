<?php

namespace App\Console\Commands;

// use App\User;
// use App\Patient;
// use App\StaffMember;
use App\RefreshTables;
use App\Appointment;
use App\Practice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;


class RefreshUserTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'refresh:users {practiceId} {--factory}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calls migrate:refresh on Users, Patients, Practitioners, and StaffMembers';

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
        $populate = $this->option('factory');

        $practice = Practice::find($practiceId);
        $practice->reconnectDB();
        RefreshTables::truncateUserTables();
        $this->info("User tables cleared");
        RefreshTables::createDefaultUser();
        $this->info("Default Practitioner created");
        if ($populate){
            RefreshTables::seedUserTables();
            $this->info("Users tables populated");
        }else{
            $this->info("User table population skipped");
        }
    }
}
