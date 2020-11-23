<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class Message extends Model
{
    use SoftDeletes;
    public $TableOptions;
    public $optionsNavValues;
    public $connectedModels;
    public $connectedModelAliases;
    public $nameAttr;

    protected $hidden = ['full_json'];
    protected $casts = [
        'status' => 'array'
    ];

    public function __construct(){
	    $this->TableOptions = array(
	    	'tableId' => 'MessageList',
	    	'index' => 'id',
            'model' => "Message",
	    	'columns' => array(
                        array(
                            "label" => 'Recipient',
                            "className" => 'name',
                            "attribute" => 'recipient_id',
                            "fetchNamesFrom" => 'User'
                        ),
                        array(
                            "label" => 'Message',
                            "className" => 'message',
                            "attribute" => 'subject!!subject!!message'
                        ),
                        array(
                            "label" => 'Type',
                            "className" => 'type',
                            "attribute" => 'type'
                        ),
                        array(
                            "label" => 'Sent',
                            "className" => 'sent',
                            "attribute" => 'created_at'
                        ),
                        array(
                            "label" => 'Status',
                            "className" => 'status',
                            "attribute" => 'decoded_status'
                        )
                    ),
	    	'hideOrder' => "type,opened,sent,message",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'orderBy' => [
                ['updated_at','desc']
            ],
            'destinations' => array(
                'expand','reply'
            ),
            'btnText' => array(
                'expand','reply'
            ),
            'extraBtns' => [
                ['manage templates',"/Template/index"]
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Message",
            'destinations' => array(
                'display','reply'
            ),
            'btnText' => array(
                'display in full','reply'
            )
        );
        // $this->nameAttr = "subject!!%type%: %subject%!!%type%: %message%";

        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popped up when required.
        // [Model, relationship]
        $this->connectedModels = array(
            ['User','many','morphToMany'],
            ['Template','one','belongsTo']
            // ['Attachment','many','morphToMany']
            // ['Form','many','morphToMany']
            // ['Service','many','morphToMany']
        );
        $this->connectedModelAliases = [
            'user' => 'recipient',
            'user' => 'sender'
        ];
    }
    public static function TableOptions(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'MessageList',
            'index' => 'id'
        ];
        if ($usertype == 'practitioner'){
            $arr = [
                        'columns' => 
                        [
                            [
                                "label" => 'Recipient',
                                "className" => 'name',
                                "attribute" => 'recipient_id',
                            ],
                            [
                                "label" => 'Message',
                                "className" => 'message',
                                "attribute" => 'subject!!subject!!message'
                            ],
                            [
                                "label" => 'Type',
                                "className" => 'type',
                                "attribute" => 'type'
                            ],
                            [
                                "label" => 'Sent',
                                "className" => 'sent',
                                "attribute" => 'created_at'
                            ],
                            [
                                "label" => 'Status',
                                "className" => 'status',
                                "attribute" => 'decoded_status'
                            ]
                        ],
                        'hideOrder' => "type,usertype,charting",
                        'filtersColumn' => [],
                        'filtersOther' => [
                            [
                                "label" => 'Form Type',
                                "filterName" => 'type',
                                "attribute" => 'form_type',
                                "markOptions" => null,
                                "filterOptions" => [
                                    ["label" => 'practitioner',"value" => 'practitioner'],
                                    ["label" => 'patient',"value" => 'patient'],
                                    ["label" => 'admin',"value" => 'admin'],
                                    ["label" => 'system',"value" => 'system']
                                ]
                            ],
                            [
                                "label" => 'Hide',
                                "filterName" => 'hide',
                                'attribute' => null,
                                'reverseFilter' => true,
                                "markOptions" => null,
                                "filterOptions" => [
                                    [
                                        "label" => 'inactive',
                                        "value" => 'active:0',
                                        'attribute'=>'active'
                                    ],
                                    ["label" => 'system forms',"value" => 'form_type:system','attribute'=>'form_type'],
                                    ["label" => 'locked forms',"value" => 'locked:1','attribute'=>'locked']
                                ]
                            ]
                        ],
                        'optionsNavValues' => [
                            'destinations' => ["settings","form-preview","forms-edit","delete"],
                            'btnText' => ["settings","preview","edit","delete"]
                        ],
                        'orderBy' => [
                            ['form_name',"asc"],
                            ['version_id',"desc"]
                        ]
            ];
        }elseif ($usertype == 'patient'){
            $arr = 
            [
                'columns' => 
                [
                    ["label" => 'Form Name',
                    "className" => 'name',
                    "attribute" => 'form_name'],
                    ["label" => 'Submitted',
                    "className" => 'submitted',
                    "attribute" => 'last_submitted'],
                    ["label" => 'Status',
                    "className" => 'status',
                    "attribute" => 'status']
                ],
                'hideOrder' => "",
                'filtersColumn' => [],
                'filtersOther' => [
                ],
                'optionsNavValues' => [
                    'destinations' => ['loadForm'],
                    'btnText' => ['open form']
                ],
                'orderBy' => [
                    ['form_name',"asc"]
                ]
            ];
        }
        return array_merge($commonArr,$arr);
    }
    public function navOptions(){
        $user = Auth::user();
        $dataAttrs = [
            [
                'key' => 'json',
                'value' => str_replace("'","\u0027",$this->full_json)
            ],
        ];
        $extraClasses = [];
        $buttons = [
            [
                'text' => 'edit form',
                'destination' => 'forms-edit'
            ],
            [
                'text' => 'portal settings',
                'destination' => 'settings'
            ],
            [
                'text' => 'preview',
                'destination' => 'form-preview'
            ],
            [
                'text' => 'delete',
                'destination' => 'delete'
            ],
        ];
        if (!$this->active) $buttons[] = ['text'=>'use this version','destination'=>'setAsActiveForm'];
        return  [
                    'dataAttrs' => $dataAttrs,
                    'extraClasses' => $extraClasses,
                    'buttons' => $buttons,
                    'instance' => $this,
                    'model' => getModel($this)
                ];
    }
    public function defaultStatus(){
        $type = $this->type;
        if ($type == 'Email'){
            return [
                'open' => [],
                'delivered' => [],
                'processed' => [],
                'bounce' => [],
                'dropped' => [],
                'pending' => [Carbon::now()->timestamp],
            ];
        }elseif ($type == "SMS"){
            return ['sent' => $d, 'event' => []];
        }elseif ($type == ""){
            return [];
        }
    }
    public function replaceMacros($changes, Appointment $appointment = null, Patient $patient = null){
        $body = $this->message;
        $user = User::find($this->recipient_id);
        if ($appointment){
            $date = $appointment->date_time->format('D M jS \a\t g:ia');
            $body = str_replace("%%date_time%%",$date,$body);
            $body = str_replace("%%appointment_link%%","<a href='".$appointment->appt_link."' target='_blank'>link</a>",$body);
            $body = str_replace("%%services%%",$appointment->service_list,$body);
            $forms = $appointment->forms();
                if ($forms->count() == 0){
                    $body = str_replace("%%form_info%%","None",$body);
                }else{
                    $formStr = "<ul>";
                    foreach($forms as $form){
                        $completed = $form->checkApptFormStatus($appointment, $patient);
                        $completedStr = $completed ? "completed" : "required";
                        $class = $completed ? "green" : "pink";
                        $formStr .= "<li>".$form->name.", <span class='little $class'>$completedStr</span></li>";
                    }
                    $formStr .= "</ul>";
                    $body = str_replace("%%form_info%%",$formStr,$body);
                }
            if ($changes){
                $changeTxt = "";
                // reportError($changes,'message 285');
                foreach($changes as $change){
                    foreach($change as $key => $values){
                        if ($key == 'date_time'){
                            $old = Carbon::parse($values['old'])->format('D M jS \a\t g:ia');
                            $new = Carbon::parse($values['new'])->format('D M jS \a\t g:ia');
                            $changeTxt .= "<p>Your appointment is now scheduled for <b>$old</b>. This was changed from $new.</p>";
                        }                        
                    }
                }
                $body = str_replace("%%appointment_changes%%",$changeTxt,$body);
            }
        }
        $body = str_replace("%%first_name%%",$user->first_name,$body);
        $body = str_replace("%%preferred_name%%",$user->preferred_name,$body);
        $body = str_replace("%%last_name%%",$user->last_name,$body);
        $body = str_replace("%%full_name%%",$user->full_name,$body);
        $body = str_replace("%%legal_name%%",$user->legal_name,$body);
        $body = str_replace("%%portal_link%%","<a href='https://bodywizardmedicine.com/portal'>Portal Link</a>",$body);
        $this->message = $body;
        // Log::info("killin it");
        $ignoreImgs = preg_replace('/"%%EMBEDDED.*%%"/', "", $body);
        return !preg_match("/%%.*%%/",$ignoreImgs);
    }
    public function moreOptions(){
        foreach($this->status as $event => $timestamps){
            $display = ['open'=>'Opened the Email', 'click'=>'Clicked a Link', 'bounce'=>'Email Bounced', 'dropped'=>'Email Dropped', 'pending'=>'Sent At', 'delivered'=>'Email Delivered', 'processed'=>'Email Processed'];
            echo "<div class='msgEvent'><h4>".$display[$event]."</h4>";
            if (count($timestamps) > 0){
                foreach($timestamps as $timestamp){
                    if (!is_array($timestamp)){
                        echo "<div>".date('g:i:sa \o\n n/j/y',$timestamp)."</div>";
                    }else{
                        foreach($timestamp as $time => $detail){
                            echo "<div>".date('g:i:sa \o\n n/j/y',$time)."<br>$detail</div>";                        
                        }
                    }
                }
            }else{
                echo "<div>never</div>";
            }
            echo "</div>";
        }
    }
    public function getDecodedStatusAttribute(){
        $status = $this->status;
        if ($this->type == 'Email'){
            if ($status['open']){
                $returnVal = ['Opened - ',lastInArray($status['open'])];
            }elseif ($status['delivered']){
                $returnVal = ['Delivered - ',lastInArray($status['delivered'])];
            }elseif ($status['processed']){
                $returnVal = ['Processed - ',lastInArray($status['processed'])];
            }elseif ($status['bounce']){
                $returnVal = ['Undeliverable - ',lastInArray($status['bounce'])];
            }elseif ($status['dropped']){
                $returnVal = ['Dropped - ',lastInArray($status['dropped'])];
            }elseif ($status['pending']){
                $returnVal = ['Sent - ',lastInArray($status['pending'])];
            }
            $returnVal[1] = dateOrTimeIfToday($returnVal[1]);
            return implode("", $returnVal);
        }elseif ($this->type == 'SMS'){
            return "sms";
        }else{
            return 'check it';
        }
    }

    public function template(){
        return $this->belongsTo('App\Template', 'template_id');
    }
    public function attachments(){
        return $this->morphToMany('App\Attachment','attachmentable');
    }
    public function images(){
        return $this->morphToMany('App\Image','imageable');
    }
    public function recipient(){
    	return $this->belongsTo('App\User', 'recipient_id');
    }
    public function sender(){
    	return $this->belongsTo('App\User','sender_id');
    }
}
