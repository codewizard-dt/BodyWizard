<?php

app()->singleton('GoogleClient',function(){
    $key = config('google')['key_file_location'];
    $client = new Google_Client();
    $client->setApplicationName("BodyWizard");
    $client->setAuthConfig($key);
    return $client;
});

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::domain('headspaceacupuncture.com')->group(function(){
	Route::any('/changes', 'PagesController@headspace');
	Route::any('{catchAll}', function(){
		return redirect('/changes');
	});
});

Route::any('/sendgrid/events', 'SendGridController@incomingEvent');

Route::get('/', 'PagesController@home');
Route::get('/about', 'PagesController@about');
Route::get('/treatments', 'PagesController@treatments');
Route::get('/conditions', 'PagesController@conditions');
Route::get('/rates', 'PagesController@rates');
Route::get('/checkmark', 'PagesController@checkmark');
Route::get('/portal/logout', 'PagesController@logout');
Route::get('/home/patients', 'PatientController@home');
Route::get("/booknow", 'PagesController@booknow');

Route::get("/loadDxForm/{type}", 'DiagnosisController@loadDxForm');
Route::post("/narrativeImgData", 'FormController@checkNarrativeImgs');

// ROUTES USING DYNAMIC {model} URI
	Route::get('/optionsNav/{model}/{uid}', 'ScriptController@OptionsNav');
	Route::get('/display/table/{model}', 'ScriptController@ResourceTable');
	Route::get('/{model}/index', 'ScriptController@ListWithNav');
	Route::get('/{model}/modal', 'ScriptController@ListAsModal');
	Route::get('/settings/{model}/{uid}', 'ScriptController@EditSettings');
	Route::get('/create/{model}', 'ScriptController@CreateNewModel');
	Route::get('/edit/{model}/{uid}', 'ScriptController@EditModel');
	Route::delete('/delete/{model}/{uid}', 'ScriptController@DeleteModel');
	Route::patch('/save/settings/{model}/{uid}', 'ScriptController@SaveSettings');
	Route::patch('/save/{model}/{uid}', 'ScriptController@UpdateModel');
	Route::post('/save/{model}', 'ScriptController@SaveNewModel');
	Route::get('/retrieve/{model}/{uid}', 'ScriptController@fetchModel');

Route::get('/home/appointments', 'AppointmentController@home');
Route::resource('appointments', 'AppointmentController');
Route::get('/home/botanicals', 'BotanicalController@home');
Route::get('/home/codes', 'CodeController@home');
Route::get('/home/complaints', 'ComplaintController@home');
Route::get('/home/diagnoses', 'DiagnosisController@home');

Route::get('/home/forms', 'FormController@home');
Route::get('/forms/{uid}/preview', 'FormController@preview');
Route::get('/forms/{uid}/settings', 'FormController@settings');
Route::resource('forms', 'FormController');

Route::get('/home/formulas', 'FormulaController@home');
Route::get('/home/messages', 'MessageController@home');
Route::get('/home/prescriptions', 'PrescriptionController@home');
Route::get('/home/services', 'ServiceController@home');
Route::get('/service/home-categories', 'ServiceCategoryController@home');
Route::get('/home/submissions', 'SubmissionController@home');
Route::get('/home/treatment_plans', 'TreatmentPlanController@home');
Route::get('/home/users', 'UserController@home');

Route::post('/setvar', 'ScriptController@SetVar');
Route::post('/getvar', 'ScriptController@GetVar');
Route::get('/calfeed', 'ScriptController@CalFeed');

Route::get('/portal', 'Auth\LoginController@showLoginForm')->name('portal') ;
Route::get('/portal/launchpad', 'PagesController@launchpad')->middleware('auth');

Auth::routes(['verify' => true]);

