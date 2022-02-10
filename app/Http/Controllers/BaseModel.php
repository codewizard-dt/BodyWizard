<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Form;
use App\Message;
use App\Template;
use App\Attachment;
use App\Image;
use App\Practice;
use App\Appointment;
use App\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Events\OutgoingMessage;
use App\Events\AppointmentSaved;
use App\Events\AppointmentCancelled;
use App\Events\BugReported;
use Google\Cloud\ErrorReporting\V1beta1\ReportErrorsServiceClient;
use Google\Cloud\ErrorReporting\V1beta1\ReportedErrorEvent;

class BaseModel extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index($model = 'Practice', Request $request, $uid = null)
    {
        if ($uid) {setUid($model, $uid);} else {
            $uid = getUid($model);
        }

        return view('layouts.table.proxy', [
            'model' => $model,
            'is_index' => true,
            'uid' => $uid,
        ]);
    }
    public function details($model, Request $request, $uid)
    {
        $class = "App\\$model";
        try {
            $details = $class::instance_details(isset($uid) ? $uid : null);
            return $details;
        } catch (\Exception $e) {
            $error = handleError($e);
            return compact('error');
        }
    }
    public function retrieve_list(Request $request)
    {
        try {
            $models = request('models', null);
            if ($models == null) {
                throw new \Exception('request must include models');
            }

            return collect($models)->mapWithKeys(function ($model) {
                $class = "App\\$model";
                if (!method_exists($class, 'get_list')) {
                    throw new \Exception("$model must use Trait TableAccess");
                    // return [$model => [['uid' => '0', 'name' => 'enable TableAccess']]];
                }

                $list = $class::get_list();

                return [$model => [
                    'list' => $list,
                    'plural' => plural($model)],
                ];
            })->toArray();
        } catch (\Exception $e) {
            $error = handleError($e);
            return compact('error');
        }
    }

    public function update_display_order($model, Request $request)
    {
        try {
            $class = "App\\$model";
            $order = request('order', null);
            if ($order == null) {
                throw new \Exception('request must include order');
            } else if ($order == 'reset') {
                $class::withoutGlobalScope('categorized')->where('settings', '!=', null)->update(["settings->Display Order" => null]);
            } else {
                collect($order)->each(function ($id, $index) use ($class) {
                    $class::find($id)->update(["settings->Display Order" => $index + 1]);
                });
            }
            return 'checkmark';
        } catch (\Exception $e) {
            $error = handleError($e);
            return compact('error');
        }
    }

    public function retrieve_single($model, Request $request)
    {
        $class = "App\\$model";
        $collection = null;
        try {
            $attrs = $request->attrs;
            $collection = $class::where($attrs)->get();
            if ($collection->count() == 0) {
                throw new \Exception('not found');
            } else if ($collection->count() > 1) {
                throw new \Exception('more than one found');
            }

            $response = $collection->first();
        } catch (\Exception $e) {
            $error = handleError($e, 'BaseModelController retrieve_single');
            return compact('error');
        }
        return $response;
    }

    public function create($model, Request $request)
    {
        return view('models.create.template', compact('model', 'request'));
    }
    public function create_or_edit($model, Request $request)
    {
        $class = "App\\$model";
        $collection = null;
        $limit = 1;
        try {
            $collection = $class::where($request->where)->limit($limit + 1)->get();
            if ($collection->count() > $limit) {
                throw new \Exception("more than $limit found");
            }

            $instance = $collection->count() == 1 ? $collection->first() : null;
            return view('models.create.template', compact('model', 'instance', 'request'));
        } catch (\Exception $e) {
            $error = handleError($e, "BaseModelController@create_or_edit $model");
            return compact('error');
        }
    }
    public function edit($model, $uid, Request $request)
    {
        try {
            $class = "App\\$model";
            $instance = $class::findOrFail($uid);
            return view("models.create.template", compact('model', 'instance', 'request'));
        } catch (\Exception $e) {
            $error = handleError($e, "BaseModelController@edit $model");
            return compact('error');
        }
    }

    public function save($model, $columns, $relationships, $uid = null)
    {
        $class = "App\\$model";
        // logger(compact('model', 'columns', 'relationships', 'uid'));
        try {
            if ($uid != null) {
                $instance = $class::findOrFail($uid);
                $no_changes = true;
                if ($relationships) {
                    foreach ($relationships as $rel => $info) {
                        $uids = $info['uids'];
                        $method = $info['method'];
                        if ($method == 'sync') {
                            $sync = $instance->$rel()->sync($uids);
                            // logger(compact('uids', 'method', 'rel', 'sync'));
                        } else {
                            throw new \Exception("Relationship method '$method' not defined");
                        }

                        if ($sync['attached'] || $sync['detached'] || $sync['updated']) {
                            $no_changes = false;
                        }

                    }
                }

                if (isset($columns['settings'])) {
                    if ($columns['settings'] == 'null') {
                        $instance->settings = null;
                    } else {
                        $instance->set_setting_by_array($columns['settings']);
                    }

                    unset($columns['settings']);
                }

                if ($columns) {
                    $instance->fill($columns);
                }

                $dirty = $instance->isDirty();

                if (!$dirty && $no_changes) {
                    throw new \Exception('no changes');
                } else {
                    $instance->save();
                }
            } else {
                $instance = new $class();
                $instance->fill($columns);
                $instance->save();
                if ($relationships) {
                    foreach ($relationships as $rel => $info) {
                        $uids = $info['uids'];
                        $method = $info['method'];
                        if ($method == 'sync') {
                            $instance->$rel()->sync($uids);
                        } else {
                            throw new \Exception("Relationship method ($method) not defined");
                        }

                    }
                }
            }
            $uid = $instance->getKey();
            setUid($model, $uid);
            // $save_response = compact('uid');
            return $instance;
            // return [
            //     'uid' => $uid,
            //     'type' => $model,
            //     'success' => true,
            // ];
        } catch (\Exception $e) {
            $error = handleError($e, 'BaseModelController save 100');
            // $request = request()->all();
            // logger(compact('request'));
            $response = compact('error');
        }
        return $response;
    }
    public function save_single($model, Request $request)
    {
        $class = "App\\$model";
        $columns = $request->input('columns', []);
        $relationships = $request->input('relationships', []);
        $uid = $request->input('uid', null);
        $instance = $this->save($model, $columns, $relationships, $uid);
        // $save_result = $this->save($model, $columns, $relationships, $uid);
        if (get($instance, 'error')) {
            $save_result = $instance;
        } else {
            if ($model === 'User') {
                $usertype = request('usertype');
                if ($usertype) {
                    $instance = $instance->$usertype;
                    $model = toKeyString($usertype);
                }
            }
            $save_result = [
                'uid' => $instance->getKey(),
                'type' => $model,
                'list' => $instance->list_map(),
                'table' => $instance->table_map(),
                'details' => $instance->details_map(),
            ];
        }
        $notification_update = Auth::user()->unreadNotifications->toJson();
        // logger(compact('notification_update'));
        return compact('save_result', 'notification_update');
    }
    public function save_multi(Request $request)
    {
        try {
            $models = collect($request->models);
            $save_response = $models->map(function ($model) {
                $columns = get($model, 'columns', []);
                $relationship = get($model, 'relationships', []);
                $uid = get($model, 'uid', null);
                logger(compact('model'));
                return $this->save($model['type'], $columns, $relationship, $uid);
            })->toArray();
            return request('wants_checkmark', false) ? 'checkmark' : compact('save_response');
        } catch (\Exception $e) {
            $error = handleError($e, 'BaseModelController save 100');
            $response = compact('error');
        }
        return $response;
    }

    public function delete($model, $uid)
    {
        try {
            $class = "App\\$model";

            $instance = $class::withoutGlobalScopes()->find($uid);
            logger("DELETE", compact('model', 'instance'));
            $instance->delete();
            unsetUid($model);
            return ['deleted' => ['uids' => [$uid]]];
        } catch (\Exception $e) {
            $error = handleError($e, "delete $model");
            return compact('error');
        }
    }
    public function delete_multi($model)
    {
        try {
            $class = "App\\$model";
            $uids = request()->uids;
            $instances = $class::withoutGlobalScopes()->whereIn('id', $uids)->get();
            $instances->each(function ($instance) {
                $instance->delete();
            });
            // $instance->delete();
            unsetUid($model);

            return ['deleted' => ['uids' => $uids]];
        } catch (\Exception $e) {
            $error = handleError($e, "delete $model");
            return compact('error');
        }
    }
    public function schedule($model, $uid, Request $request)
    {
        try {
            $class = "App\\$model";
            $instance = $class::find($uid);
            return view("models.create.schedule", compact('instance', 'model', 'uid'));
        } catch (\Exception $e) {
            $error = handleError($e, "edit $model");
            return compact('error');
        }
    }

    public function settings($model, $uid, Request $request)
    {
        try {
            $class = "App\\$model";
            if ($uid == 'multi') {
                $instance = new $class(['proxy' => true, 'multi' => request('uids')]);
            } elseif ($uid == 'proxy') {
                $instance = new $class(['proxy' => true]);
            } else {
                $instance = $class::findOrFail($uid);
            }

            return view("models.settings.template", compact('instance', 'model', 'uid', 'request'));
        } catch (\Exception $e) {
            $error = handleError($e, "settings $model");
            return compact('error');
        }
    }
    public function schedulePractice(Request $request)
    {
        try {
            $uid = getUid('Practice');
            $model = 'Practice';
            $instance = Practice::findOrFail(getUid('Practice'));
            return view("models.create.schedule", compact('instance', 'model', 'uid'));
        } catch (\Exception $e) {
            $error = handleError($e, "edit $model");
            return compact('error');
        }
    }
    public function BasicList($model, Request $request)
    {
        $columns = $request->columns;
        return basicList($model, $columns);
    }
    public function saveSubmissions(Request $request)
    {
        try {
            $submissions = collect($request->submissions);
            $apptId = $request->columns['appointment_id'];
            $appt = Appointment::findOrFail($apptId);
            $user = Auth::user();
            $shared = [
                'patient_id' => $appt->patient->id,
                'appointment_id' => $appt->id,
                'submitted_by' => $user->user_type,
                'submitted_by_user_id' => $user->id,
            ];
            $savedIds = $submissions->map(function ($responses, $formId) use ($shared) {
                $form = Form::findOrFail($formId);
                $submission = \App\Submission::create([
                    'responses' => $responses,
                    'form_uid' => $form->form_uid,
                    'form_id' => $form->form_id,
                    'form_name' => $form->form_name,
                    'form_user_type' => $form->user_type,
                    'patient_id' => $shared['patient_id'],
                    'appointment_id' => $shared['appointment_id'],
                    'submitted_by' => $shared['submitted_by'],
                    'submitted_by_user_id' => $shared['submitted_by_user_id'],
                ]);
                return $submission->id;
            })->toArray();
            $result = $savedIds;
        } catch (\Exception $e) {
            reportError($e, 'script controller, save submissions');
            $result = null;
        }
        return $result;
    }
    public function AddNotes($model, $uid)
    {
        return view('layouts.forms.add-note-modal', ["model" => $model, "uid" => $uid]);
    }
    public function savePinnedNotes($model, $uid, Request $request)
    {
        try {
            $class = "App\\$model";
            $instance = $class::find($uid);
            $instance->notes = $request->notes;

            if (array_key_exists('autosave', $instance->makeVisible('autosave')->attributesToArray())) {
                if ($instance->autosave) {
                    $data = $instance->autosave;
                    $data['notes'] = $request->notes;
                    $instance->autosave = $data;
                } else {
                    $instance->autosave = ['notes' => $request->notes];
                }
            }
            $instance->save();
        } catch (\Exception $e) {
            reportError($e, 'BaseModel 419');
        }

        return isset($e) ? $e : 'checkmark';
    }

    // EDIT / SAVE SETTINGS / SCHEDULE
    public function fetchModel($model, $uid, Request $request)
    {
        $class = "App\\$model";
        if ($uid == 'default') {
            $existingInstance = $class::where('name', 'default')->first();
            if (!$existingInstance) {return "not found";}
        } else {
            $existingInstance = $class::find($uid);
            if (!$existingInstance) {return "not found";}
        }
        // $uid = ($uid == 'default') ? 2 : $uid;
        embeddedImgsToDataSrc($existingInstance, $model);
        if ($model == 'Form') {
            return $existingInstance->formDisplay(true);
        } elseif ($model == "Submission") {
            return $existingInstance->form->formDisplay(true, false) . "<div id='responses' data-json='" . json_encode($existingInstance->responses) . "'></div>";
        } else {
            return $existingInstance;
        }
    }
    public function selection_modal($model, Request $request)
    {
        return view('layouts.table.proxy', compact('model'));
    }

}
