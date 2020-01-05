<?php

namespace App\Logging;

use Monolog\Logger;
use Google\Cloud\Logging\LoggingClient;
use Monolog\Handler\PsrHandler;

class CreateStackdriverLogger
{
    public function __invoke(array $config)
    {
    	// $logging = new LoggingClient([
    	// 	'projectId' => 'bodywizard'
    	// ]);
        $logger = LoggingClient::psrBatchLogger('app');
        // $logger = $logging->psrLogger('app');
        $handler = new PsrHandler($logger);

        return new Logger('stackdriver', [$handler]);
    }
}
