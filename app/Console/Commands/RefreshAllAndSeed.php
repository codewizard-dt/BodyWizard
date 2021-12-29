<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use App\RefreshTables;

class RefreshAllAndSeed extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'refresh:all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Runs migrate:refresh, then creates default admin and seeds databases';

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
        $this->info('Refreshing databases');
        Artisan::call('migrate:refresh --seed -vvv');
        Artisan::call('make:practice "Body Wizard"');
        RefreshTables::seedComplaintTables();

        Artisan::call('refresh:users --factory');

    }
}
