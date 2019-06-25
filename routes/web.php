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

Route::get('/', 'PagesController@home');
Route::get('/about', 'PagesController@about');
Route::get('/treatments', 'PagesController@treatments');
Route::get('/conditions-treated', 'PagesController@conditions');
Route::get('/rates', 'PagesController@rates');
Route::get('/checkmark', 'PagesController@checkmark');
Route::get('/portal/logout', 'PagesController@logout');
Route::get('/home/patients', 'PatientController@home')->middleware('auth');
Route::get("/booknow", 'PagesController@booknow');

// Route::get('/optionsNav/{model}/{uid}', 'ScriptController@OptionsNav');
// Route::get('/display/table/{model}', 'ScriptController@ResourceTable');
// Route::get('/{model}/index', 'ScriptController@ListWithNav');
// Route::get('/{model}/modal', 'ScriptController@ListAsModal');
// Route::get('/settings/{model}/{uid}', 'ScriptController@EditSettings');
// Route::get('/create/{model}', 'ScriptController@CreateNewModel');
// Route::get('/edit/{model}/{uid}', 'ScriptController@EditModel');
// Route::delete('/delete/{model}/{uid}', 'ScriptController@DeleteModel');
// Route::patch('/save/settings/{model}/{uid}', 'ScriptController@SaveSettings');
// Route::patch('/save/{model}/{uid}', 'ScriptController@UpdateModel');
// Route::post('/save/{model}', 'ScriptController@SaveNewModel');

// Route::get('/home/appointments', 'AppointmentController@home');
// Route::resource('appointments', 'AppointmentController');
// Route::get('/home/botanicals', 'BotanicalController@home');
// // Route::resource('botanicals', 'BotanicalController');
// Route::get('/home/codes', 'CodeController@home');
// // Route::resource('codes', 'CodeController');
// Route::get('/home/complaints', 'ComplaintController@home');
// // Route::resource('complaints', 'ComplaintController');
// Route::get('/home/diagnoses', 'DiagnosisController@home');
// // Route::resource('diagnoses', 'DiagnosisController');

// Route::get('/home/forms', 'FormController@home');
// Route::get('/forms/{uid}/preview', 'FormController@preview');
// Route::get('/forms/{uid}/settings', 'FormController@settings');
// Route::resource('forms', 'FormController');

// Route::get('/home/formulas', 'FormulaController@home');
// // Route::resource('formulas', 'FormulaController');
// Route::get('/home/messages', 'MessageController@home');
// // Route::resource('messages', 'MessageController');
// Route::get('/home/prescriptions', 'PrescriptionController@home');
// // Route::resource('prescriptions', 'PrescriptionController');
// Route::get('/home/services', 'ServiceController@home');
// // Route::resource('services', 'ServiceController');
// Route::get('/service/home-categories', 'ServiceCategoryController@home');
// // Route::resource('service-categories', 'ServiceCategoryController');
// Route::get('/home/submissions', 'SubmissionController@home');
// // Route::resource('submissions', 'SubmissionController');
// Route::get('/home/treatment_plans', 'TreatmentPlanController@home');
// // Route::resource('treatment_plans', 'TreatmentPlanController');
// Route::get('/home/users', 'UserController@home');
// // Route::resource('users', 'UserController');

// Route::post('/setvar', 'ScriptController@SetVar');
// Route::post('/getvar', 'ScriptController@GetVar');
// Route::get('/calfeed', 'ScriptController@CalFeed');

// Route::get('/portal', 'Auth\LoginController@showLoginForm')->name('portal') ;
// Route::get('/portal/launchpad', 'PagesController@launchpad')->middleware('auth');

// Auth::routes(['verify' => true]);

