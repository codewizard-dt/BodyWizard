<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class SaveCurrentForms extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forms:save';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates forms to install on new practices';

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
        // $forms = DB::table('forms')->where('settings->system','true')->select('form_name','settings','sections')->get()->all();
        $forms = \App\Form::where('settings->system','true')->select('name','settings','sections')->get()->all();
        Storage::disk('local')->put('/basicEhr/forms.json',json_encode($forms));
        $this->info("forms saved");
    }
}
