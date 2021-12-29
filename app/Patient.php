<?php

namespace App;

use App\Traits\IsUser;
use App\Traits\TableAccess;
use App\Traits\TrackChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use IsUser;
    use TrackChanges;
    use TableAccess;
    use SoftDeletes;

    protected $casts = [
        'settings' => 'array',
    ];
    protected $guarded = [];
    protected $visible = ['id', 'user_id', 'roles'];
    protected $with = ['User'];
    // protected $appends = ['name'];
    public static $instance_actions = [];
    public static $static_actions = [];

    public static function table()
    {
        $columns = [
            'Name' => 'name',
            'Phone' => 'phone',
            'Email' => 'email',
        ];
        $filters = [];
        $buttons = [];
        $data = [];
        return compact('columns', 'filters', 'buttons', 'data');
    }
    public function details()
    {
        $instance = [
            // 'Category' => $this->category_name,
            // 'Description' => $this->description,
        ];
        return $instance;
    }
    public function basic_info()
    {
        return [
            'name' => $this->name,
            'first_name' => $this->preferred_name,
            'last_name' => $this->last_name,
            'uid' => $this->getKey(),
        ];
    }

    public function user()
    {return $this->belongsTo('App\User', 'user_id');}

    // public function __get($key) {
    //   if ($this->getAttribute($key)) return $this->getAttribute($key);
    //   else if ($this->user->getAttribute($key)) return $this->user->getAttribute($key);
    //   else return null;
    // }

    public function complaints()
    {
        return $this->morphToMany('App\Complaint', 'complaintable');
    }
    public function appointments()
    {
        return $this->morphToMany('App\Appointment', 'appointmentable');
    }
    public function submissions()
    {
        return $this->hasMany("App\Submission");
    }

    // public function getNameAttribute(){ return $this->user->name; }

    // public function getNextAppointmentAttribute(){
    //   return $this->upcoming_appointments ? $this->upcoming_appointments->first() : null;
    // }
    // public function getUpcomingAppointmentsAttribute(){
    //   $appts = $this->appointments()->where('date_time','>=',Carbon::now())->orderBy('date_time','asc')->take(5)->get();
    //   return $appts ? $appts : null;
    // }
    // public function getLastAppointmentAttribute(){
    //   return $this->prev_appointments ? $this->prev_appointments->first() : null;
    // }
    // public function getPrevAppointmentsAttribute(){
    //   $appts = $this->appointments()->where('date_time','<=',Carbon::now())->orderBy('date_time','desc')->take(5)->get();
    //   return $appts ? $appts : null;
    // }
    // public function getLastSeenAttribute(){
    //   $last = $this->last_appointment;
    //   return $last ? $last->date_time->format('n/j/y') : 'never';
    // }

    // public function isNewPatient(){
    //   $appts = $this->appointments()->where("status->completed",true)->get();
    //   return (count($appts) == 0);
    // }
    // public function getIsActiveAttribute(){
    //   $appts = $this->appointments()->where([
    //     ['date_time','>',Carbon::now()->subUnit('month',6)->toDateTimeString()],
    //     ['date_time','<',Carbon::now()->addUnit('month',1)->toDateTimeString()]
    //   ])->get();
    //   return (count($appts) != 0);
    // }
    // public function getIsInactiveAttribute(){
    //   return !$this->is_active;
    // }

    // public function getHasApptsThisWeekAttribute(){
    //   $appts = $this->appointments()->where([
    //     ['date_time','>',Carbon::now()->subUnitNoOverflow('week',1,'week')->toDateTimeString()],
    //     ['date_time','<',Carbon::now()->addUnitNoOverflow('week',1,'week')->toDateTimeString()]
    //   ])->get();
    //   return (count($appts) != 0);
    // }
    // public function getHasApptsThisMonthAttribute(){
    //   $appts = $this->appointments()->where([
    //     ['date_time','>',Carbon::now()->subUnitNoOverflow('month',1,'month')->toDateTimeString()],
    //     ['date_time','<',Carbon::now()->addUnitNoOverflow('month',1,'month')->toDateTimeString()]
    //   ])->get();
    //   return (count($appts) != 0);
    // }
    // public function getHasApptsTodayAttribute(){
    //   $appts = $this->appointments()->where([
    //     ['date_time','>',Carbon::now()->subUnitNoOverflow('day',1,'day')->toDateTimeString()],
    //     ['date_time','<',Carbon::now()->addUnitNoOverflow('day',1,'day')->toDateTimeString()]
    //   ])->get();
    //   return (count($appts) == 0);
    // }
    // public function lastPractitioner(){
    //   $lastAppt = $this->appointments()->where("status->completed")->orderBy("date_time","desc")->get();
    //       // dd($lastAppt);
    //   return $lastAppt;
    // }
    // public function lastServices(){

    // }
    // public function lastCompletedAppt(){
    //   $lastAppt = $this->appointments()->where("status->completed")->orderBy("date_time","desc")->get();
    //   return $lastAppt;
    // }
}
