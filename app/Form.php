<?php

namespace App;

use App\Image;
use App\Appointment;
use App\Submission;
use App\Patient;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Traits\TableAccess;
use App\Traits\HasSettings;

class Form extends Model
{
    use TableAccess;
    use HasSettings;

    // protected $primaryKey = 'form_uid';
    protected $visible = ['id', 'name', 'sections', 'form_id', 'version_id', 'settings', 'autosave', 'responses', 'submission_id'];
    protected $guarded = [];

    protected $casts = [
        'sections' => 'array',
        'settings' => 'array',
    ];

    public static $instance_actions = [
        [
            'text' => 'preview',
            'action' => 'Form.preview',
            'class_list' => 'xsmall yellow',
        ],
    ];
    public static $static_actions = [];

    public static function table()
    {
        $columns = [
            'Usage' => 'setting:Availability + Usage.GeneralUsage:not set:usage',
            'Filled By' => 'setting:Availability + Usage.FilledOutBy:not set:filled_by',
        ];
        $bool_cols = ['charting'];
        if (Auth::user()->is_superuser) {
            $columns['System'] = 'setting:system:not set:system';
            $bool_cols[] = 'system';
        }
        $filters = [
            new_input('checkboxes',
                ['name', 'list', 'ele_css', 'preLabel', 'labelHtmlTag', 'labelClass'],
                ['usage', ['clinical', 'administrative'], ['textAlign' => 'left'], '<i>Filter</i> - Form Usage', 'h3', 'purple'],
            ),
            new_input('checkboxes',
                ['name', 'list', 'ele_css', 'preLabel', 'labelHtmlTag', 'labelClass'],
                ['filled_by', ['patient', 'practitioner'], ['textAlign' => 'left'], '<i>Filter</i> - Filled By', 'h3', 'purple'],
            ),
        ];
        $buttons = [];
        $data = [];

        return compact('columns', 'filters', 'buttons', 'data', 'bool_cols');
    }
    public function details()
    {
        return [
            'name' => $this->name,
        ];
    }

    // protected static function boot()
    // {
    //     parent::boot();

    //     static::addGlobalScope('sys', function (Builder $builder) {
    //         if (Auth::check() && !Auth::user()->is_superuser) {
    //             $builder->where('settings->system', '!=', 'true');
    //         }

    //     });
    // }

    public static function successResponse()
    {
        $form = Form::find(getUid('Form'));
        return ['uid' => $form->id, 'form_id' => $form->form_id, 'version_id' => $form->version_id];
    }
    public static function nextFormId()
    {
        $max = Form::select('form_id')->orderBy('form_id', 'desc')->limit(1)->get()->first();
        $next = $max ? $max->form_id + 1 : 1;
        return $next;
    }
    public function nextVersionId()
    {
        $max = Form::where('form_id', $this->form_id)->orderBy('version_id', 'desc')->limit(1)->get()->first();
        $next = $max ? $max->version_id + 1 : 1;
        return $next;
    }

    public function scopeCharting($query)
    {
        $usertype = session('usertype');
        return $query->whereJsonContains("settings->Availability + Usage->FilledOutBy", $usertype)
            ->whereJsonContains("settings->Availability + Usage->GeneralUsage", 'clinical');
    }

    public function newestVersion()
    {
        return Form::where('form_id', $this->form_id)->orderBy('version_id', 'desc')->limit(1)->get()->first();
    }
    public static function getActiveVersion($formId)
    {
        return Form::where([['form_id', $formId], ['active', 1]])->limit(1)->get()->first();
    }
    public function activeVersion()
    {
        return Form::where([['form_id', $this->form_id], ['active', 1]])->limit(1)->get()->first();
    }

    public function getIsSystemAttribute()
    {
        return $this->get_setting_bool('system');
    }
    public function getSectionNamesAttribute()
    {
        return collect($this->sections)->transform(function ($section) {return $section['name'];})->all();
    }
    public function lastSubmittedBy(Patient $patient)
    {
        $submissions = $this->submissions();

        $id = $patient->id;
        $submission = $submissions->get()->filter(function ($sub, $s) use ($id) {
            return $sub->patient_id == $id;
        })->last();

        if ($submission) {
            return dateOrTimeIfToday($submission->created_at->timestamp);
        } else {
            return 'never';
        }
    }
    public function services()
    {
        return $this->morphedByMany('App\Service', 'formable', null, 'form_id');
    }
    public function images()
    {
        return $this->morphToMany('App\Image', 'imageable');
    }
    public function submissions()
    {
        return $this->hasMany('App\Submission', "form_id", 'form_id');
    }
}
