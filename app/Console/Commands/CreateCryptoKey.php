<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CreateCryptoKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:cryptokey {practiceId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates a cryptokey';

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

        $practiceId = $this->argument('practiceId');
        try{
            makeCryptoKey($practiceId);
        }catch(\Exception $e){
            $this->error($e);
        }
    }
}
