<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Google\Cloud\ErrorReporting\Bootstrap;
// use App\Events\BugReported;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Log;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        if (isset($_SERVER['GAE_SERVICE'])) {
            if ($this->shouldReport($exception)) {
                Bootstrap::exceptionHandler($exception);
            }
        } else {
            // Standard behavior
            // event(new BugReported(
            //     [
            //         'description' => "Uncaught Exception", 
            //         'details' => $exception, 
            //         'category' => 'Exceptions', 
            //         'location' => 'ExceptionHandler',
            //         'user' => Auth::check() ? Auth::user()->id : null
            //     ]
            // ));
            // Log::error($exception);

            parent::report($exception);
        }
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        return parent::render($request, $exception);
    }
}
