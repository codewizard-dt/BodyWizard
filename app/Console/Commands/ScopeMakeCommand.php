<?php

namespace App\Console\Commands;

use Illuminate\Console\GeneratorCommand;

class ScopeMakeCommand extends GeneratorCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $name = 'make:scope';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new scope';

    protected function getStub()
    {
        return __DIR__ . '/stubs/scope.stub';
    }
    /**
     * Get the default namespace for the class.
     *
     * @param  string  $rootNamespace
     * @return string
     */
    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '\Scopes';
    }

    // /**
    //  * The console command description.
    //  *
    //  * @var string
    //  */
    // protected $description = 'Command description';

    // /**
    //  * Create a new command instance.
    //  *
    //  * @return void
    //  */
    // public function __construct()
    // {
    //     parent::__construct();
    // }

    // /**
    //  * Execute the console command.
    //  *
    //  * @return mixed
    //  */
    // public function handle()
    // {
    //     //
    // }
}
