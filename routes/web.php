<?php
use Illuminate\Support\Facades\Log;

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
// PUSH NOTIFICATIONS
Route::any('/push/sendgrid', 'PushController@incomingSendGrid');
Route::any('/push/google/calendar', 'PushController@incomingGoogle');
Route::any('/push/twilio/sms', 'PushController@incomingTwilioSms');
Route::any('/push/twilio/error', 'PushController@twilioError');
Route::get('/pusher/test', 'PushController@pushertest');
Route::domain('bodywizard.ngrok.io')->group(function(){
	Route::any('/', 'PushController@googlePushVerification');
});

Route::domain('headspaceacupuncture.com')->group(function(){
	Route::any('/changes', 'PagesController@headspace');
	Route::any('{catchAll}', function(){
		return redirect('/changes');
	});
});

Route::any('/notification-unread', 'NotificationController@getUnread');
Route::post('/notification-retrieve', 'NotificationController@retrieve');
Route::post('/notification-update', 'NotificationController@update');
Route::post('/notification-delete', 'NotificationController@delete');

Route::get('/', 'PagesController@home');
Route::get('/about', 'PagesController@about');
Route::get('/treatments', 'PagesController@treatments');
Route::get('/conditions', 'PagesController@conditions');
Route::get('/rates', 'PagesController@rates');
Route::get('/checkmark', 'PagesController@checkmark');
Route::get('/home/patients', 'PatientController@home');
Route::get("/booknow", 'PagesController@booknow');

// Route::get('/schedule/Practice', 'ScheduleController@EditPracticeSchedule');
// Route::post('/schedule/Practice/save', 'ScheduleController@SavePracticeSchedule');
Route::get('/schedule/appointments', 'ScheduleController@appointmentEventFeed');
Route::get('/schedule/non-ehr', 'ScheduleController@nonEhrEventFeed');

// ROUTES USING DYNAMIC {model} URI
	Route::get('/optionsNav/{model}/{uid}', 'ScriptController@OptionsNav');
	Route::get('/options-nav/{model}/{uid}', 'ScriptController@OptionsNavNew');
	Route::get('/display/table/{model}', 'ScriptController@ResourceTable');
	Route::post('/{model}/list', 'ScriptController@BasicList');
	Route::get('/{model}/index', 'ScriptController@ListWithNav');
	Route::get('/portal/practices', 'ScriptController@ListWithNav');
	Route::get('/{model}/modal', 'ScriptController@ListAsModal');
	Route::get('/create/{model}', 'ScriptController@CreateNewModel');
	Route::delete('/delete/{model}/{uid}', 'ScriptController@delete');
	Route::get('/addNote/{model}/{uid}', 'ScriptController@AddNotes');
	Route::post('/save/multi', 'ScriptController@save_multi');
	Route::post('/save/{model}', 'ScriptController@save_single');
	Route::post('/retrieve/multi', 'ScriptController@retrieve_multi');
	Route::post('/retrieve/{model}', 'ScriptController@retrieve_single');
	Route::post('/create_or_edit/{model}', 'ScriptController@create_or_edit');
	Route::get('/edit/{model}/{uid}', 'ScriptController@edit');
	Route::get('/schedule/{model}/{uid}', 'ScriptController@schedule');
	Route::get('/settings/{model}/{uid}', 'ScriptController@settings');
	Route::get('/schedule/Practice', 'ScriptController@schedulePractice');
	Route::get('/retrieve/{model}/{uid}', 'ScriptController@fetchModel');
	Route::post('/savePinnedNotes/{model}/{uid}', 'ScriptController@savePinnedNotes');

Route::get('/icd-api/token', 'CodeController@getIcdApiToken');
// Route::get('/home/appointments', 'AppointmentController@home');
Route::get('/appointments/calendar', 'AppointmentController@calendar');
// Route::get('/appointment/{uid}/get-chart-note', 'AppointmentController@getChartNote');
// Route::get('/appointment/{uid}/edit-chart-note', 'AppointmentController@editChartNote');
// Route::get('/ChartNote/create','ChartNoteController@create');
// Route::get('/ChartNote/{id}/view','ChartNoteController@view');
// Route::get('/ChartNote/{id}/edit','ChartNoteController@edit');
// Route::post('/ChartNote/{id}/autosave','ChartNoteController@autosave');
// Route::post('/ChartNote/{id}/sign','ChartNoteController@sign');
// Route::get('/ChartNote/load-form/{formId}','ChartNoteController@loadForm');

// Route::get('/Invoice/create','InvoiceController@create');
// Route::get('/appointment/{uid}/get-invoice', 'AppointmentController@getInvoice');
// Route::get('/appointment/{uid}/edit-invoice', 'AppointmentController@editInvoice');
// Route::get('/Invoice/{id}/view','InvoiceController@view');
// Route::get('/Invoice/{id}/edit','InvoiceController@edit');
// Route::post('/Invoice/{id}/autosave','InvoiceController@autosave');
// Route::post('/Invoice/{id}/save','InvoiceController@save');

Route::post('user/{userId}/invoice/{invoiceId}/get-payment-intent','StripeController@getPaymentIntent');

// Route::resource('appointments', 'AppointmentController');
// Route::get('/home/botanicals', 'BotanicalController@home');
// Route::get('/home/codes', 'CodeController@home');
// Route::get('/home/complaints', 'ComplaintController@home');
// Route::get('/home/diagnoses', 'DiagnosisController@home');

Route::match(['get','post'],'/form/display/{form}','FormController@get_html');
Route::get('/form/preview/{form}','FormController@get_html_preview');
Route::post('/form/{uid}/submit','FormController@submit');
Route::get('/home/forms', 'FormController@home');
Route::get('/forms/{uid}/preview', 'FormController@preview');
Route::get('/forms/{uid}/settings', 'FormController@settings');
Route::get('/forms/{uid}/setAsActive', 'FormController@setAsActive');
Route::get('/forms/UID/edit','FormController@edit');
Route::resource('forms', 'FormController');

Route::get('/home/formulas', 'FormulaController@home');
Route::get('/home/messages', 'MessageController@home');
Route::get('/home/prescriptions', 'PrescriptionController@home');
Route::get('/home/services', 'ServiceController@home');
Route::get('/service/home-categories', 'ServiceCategoryController@home');
Route::get('/home/submissions', 'SubmissionController@home');
Route::get('/home/treatment_plans', 'TreatmentPlanController@home');
Route::get('/home/users', 'UserController@home');

Route::get('/schedule/feed', 'ScheduleController@scheduleFeed');

Route::get('/portal', 'Auth\LoginController@showLoginForm')->name('portal');
Route::post('/portal/select_role', 'PagesController@setRole')->middleware('auth');
Route::get('/portal/launchpad', 'PagesController@launchpad')->middleware('auth');
// Route::get('/portal/settings', 'PagesController@portalsettings')->middleware('auth');
// Route::get('/portal/practices', 'PagesController@practicesettings')->middleware('auth');
// Route::get('/portal/settings/display/{model}', 'SettingsController@displaySettings')->middleware('auth');
Route::get('/portal/settings/panel', 'SettingsController@panel')->middleware('auth');
Route::post('/portal/settings/display-order', 'SettingsController@displayOrderUpdate')->middleware('auth');

Route::get('/practice/contact-info','PracticeController@contactInfo')->middleware('auth');
Route::get('/practice/legal-info','PracticeController@legalInfo')->middleware('auth');
Route::get('/practice/create','PracticeController@create')->middleware('auth');

Route::resource('bugs', 'BugController');

Route::any('/keep-session', function(){return 'ok';});	
Route::any('/portal/logout', 'PagesController@logout')->name('logout');

Route::get('/artisan/execute/{command}', 'ArtisanController@execute');

Auth::routes(['verify' => true]);

