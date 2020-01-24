<?php
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Google\Cloud\ErrorReporting\V1beta1\ReportedErrorEvent;
use Google\Cloud\ErrorReporting\V1beta1\ErrorContext;
use Google\Cloud\ErrorReporting\V1beta1\SourceLocation;

use App\Bug;
use App\Image;
use App\Form;
use App\Practitioner;

$menuJson = json_decode(file_get_contents(app_path("/json/menu-data.json")),true);
function listReturn($requestStatus, $url='not given'){
  if (is_array($requestStatus)){
    $requestStatus = json_encode($requestStatus);
  }
  $withLists = [
    'message'=> $requestStatus,
    'url'=> $url,
    'uidList' => session('uidList'),
    'tabList' => session('CurrentTabs')
  ];
  return $withLists;
}
function getPractice($practiceId){
  $practice = Practice::where('practice_id',$practiceId)->get();
  return $practice;
}
function reportError($exception,$location=null){
  if (isset($_SERVER['GAE_SERVICE'])) {
    $event = new ReportedErrorEvent();
    if (is_a($exception, 'Exception')){
      $event->setMessage("PHP Notice: ".(string)$exception);
    }else{
      // $context = new ErrorContext();
      // $location = new SourceLocation();
      // $location->setFunctionName( [UPDATE] );
      // $location->setLineNumber( [UPDATE] );
      // $location->setFilePath( [UPDATE] );
      // $context->setReportLocation($location);
    }
    $project = app('GoogleErrors')->projectName('bodywizard');
    app('GoogleErrors')->reportErrorEvent($project,$event);
  }else{
    if ($location){
      Log::error($exception,['location'=>$location,'class'=>get_class($exception)]);
    }else{
      Log::error($exception);
    }
  }
}

// String related functions
  function plural($str){return Str::plural($str);}
  function singular($str){return Str::singular($str);}
  function snake($str){return Str::snake($str);}
  function camel($str){return Str::camel($str);}
  function title($str){return Str::title($str);}
  function contains($str,$search){return Str::contains($str,$search);}
  function uuid(){return Str::orderedUuid()->toString();}
  function uuidNoDash(){return str_replace("-","",Str::orderedUuid()->toString());}
  function proper($str){return Str::title(str_replace("_"," ",snake($str)));}
  function pluralSpaces($str){
    $str = plural($str);
    $str = Str::snake($str);
    $str = unreplacespaces($str);
    return $str;
  }
  function singularSpaces($str){
    $str = singular($str);
    $str = Str::snake($str);
    $str = unreplacespaces($str);
    return $str;
  }

  function revertJsonBool($array){
    foreach ($array as $key => $value){
      if (is_array($value)){
        $value = revertJsonBool($value);
        $array[$key] = $value;
      }else{
        if ($value === "true"){$value = true;}
        elseif ($value === "false"){$value = false;}
        $array[$key] = $value;
      }
    }
    return $array;
  }
  function isEven($num){return $num % 2 == 0;}
  function isOdd($num){return $num % 2 == 1;}
  function boolToYN(bool $bool){return $bool ? "yes" : "no";}

  function cleaninput($data) {
      if (is_array($data)){
          foreach ($data as $key=>$value){
            $cleanvalue = trim($value);
            $cleanvalue = str_replace('\'', '', $value);
            $cleanvalue = str_replace('[', '', $value);
            $cleanvalue = str_replace(']', '', $value);
            $cleanvalue = str_replace('(', '', $value);
            $cleanvalue = str_replace(')', '', $value);
            $cleanvalue = str_replace(';', '', $value);
            $cleanvalue = stripslashes($value);
            $cleanvalue = stripquotes($value);
            $cleanvalue = htmlspecialchars($value);
              $cleanarray[]=$cleanvalue;
          }
          return $cleanarray;        
      }else{
        $data = trim($data);
        $data = str_replace('\'', '', $data);
        $data = str_replace(';', '', $data);
        $data = str_replace('[', '', $data);
        $data = str_replace(']', '', $data);
        $data = str_replace('(', '', $data);
        $data = str_replace(')', '', $data);
        $data = stripslashes($data);
        $data = stripquotes($data);
        $data = htmlspecialchars($data);
        return $data;
      }
  }
  function removepunctuation($data){
        $data = str_replace('?', '', $data);
        $data = str_replace('!', '', $data);
        $data = str_replace(':', '', $data);
        $data = str_replace('+', '', $data);
        $data = str_replace('  ', ' ', $data);
        return $data;
  }
  function stripquotes($data){
      $data = str_replace("\"","",$data);
      $data = str_replace("'","",$data);
      return $data;
  }
  function replacespaces($data){
      $data = str_replace(" ","_",$data);
      return $data;
  }
  function unreplacespaces($data){
      $data = str_replace("_"," ",$data);
      return $data;
  }
  function removespaces($data){
      $data = str_replace(" ","",$data);
      return $data;
  }
  // function removenull($data){
  //     $key = array_search('-',$data);
  //     if ($key>0){
  //         unset($data[$key]);
  //     }
  //     return $data;
  // }
  // function formatDate($date){
  //     $formatDate = date_create($date);
  //     $formatDate = date_format($formatDate,"M j, Y");
  //     return $formatDate;
  // }

// Array related functions

  function randomElement($array){
    return Arr::random($array);
  }

  function addTo(&$addToArray,$keyValueArray){
    foreach ($keyValueArray as $key => $value){
      Arr::add($addToArray,$key,$value);
    }
    // return Arr::add($addToArray,$key,$value);
  }

// Date / Schedule related functions
  function dateOrTimeIfToday($timestamp){
    if (!$timestamp){return "never";}
    if ($timestamp == 'never'){return "never";}
    $timestamp = Carbon::createFromTimestamp($timestamp);
    if ($timestamp->isToday()){
      $timestamp = $timestamp->format("g:i A");
    }else{
      $timestamp = $timestamp->format("n/j/Y");
    }
    return $timestamp;
  }
  function displayDays($days){
    $str = "";
    if ($days["Sunday"]){
      $str .= "Sun, ";
    }
    if ($days["Monday"]){
      $str .= "Mon, ";
    }
    if ($days["Tuesday"]){
      $str .= "Tue, ";
    }
    if ($days["Wednesday"]){
      $str .= "Wed, ";
    }
    if ($days["Thursday"]){
      $str .= "Thu, ";
    }
    if ($days["Friday"]){
      $str .= "Fri, ";
    }
    if ($days["Saturday"]){
      $str .= "Sat, ";
    }
    $str = str_replace("Mon, Tue, Wed, Thu, Fri", "Mon-Fri", $str);
    $str = str_replace("Mon, Tue, Wed, Thu", "Mon-Thu", $str);
    $str = str_replace("Mon, Tue, Wed", "Mon-Wed", $str);
    $str = str_replace("Tue, Wed, Thu, Fri", "Tue-Fri", $str);
    $str = str_replace("Tue, Wed, Thu", "Tue-Thu", $str);
    $str = str_replace("Wed, Thu, Fri", "Wed-Fri", $str);
    $str = substr($str, 0, strlen($str)-2);
    return $str;
  }
  function numericalWeekday($day){
    if ($day->isSunday()){$dayNumerical = 0;}
    elseif ($day->isMonday()){$dayNumerical = 1;}
    elseif ($day->isTuesday()){$dayNumerical = 2;}
    elseif ($day->isWednesday()){$dayNumerical = 3;}
    elseif ($day->isThursday()){$dayNumerical = 4;}
    elseif ($day->isFriday()){$dayNumerical = 5;}
    elseif ($day->isSaturday()){$dayNumerical = 6;}
    return $dayNumerical;
  }
  function scheduleToEvents($schedule, $exceptions = []){
    // Log::info($schedule);
    $today = Carbon::now();
    if ($today->isSunday()){$todayNumerical = 0;}
    elseif ($today->isMonday()){$todayNumerical = 1;}
    elseif ($today->isTuesday()){$todayNumerical = 2;}
    elseif ($today->isWednesday()){$todayNumerical = 3;}
    elseif ($today->isThursday()){$todayNumerical = 4;}
    elseif ($today->isFriday()){$todayNumerical = 5;}
    elseif ($today->isSaturday()){$todayNumerical = 6;}
    $map = ['Sunday'=>0,'Monday'=>1,'Tuesday'=>2,'Wednesday'=>3,'Thursday'=>4,'Friday'=>5,'Saturday'=>6];
    $eventBlocks = [];
    $earliest = Carbon::create('11:59pm');
    $latest = Carbon::create('12:01am');

    foreach ($schedule as $x => $timeBlock){
      $isBreak = isset($timeBlock['break']) ? $timeBlock['break'] : false;
      $newEvent = [
        "title" => '',
        "start" => $timeBlock["start_time"],
        "end" => $timeBlock["end_time"],
        "classNames" => ["timeBlock"],
        "extendedProps" => [
          'block' => $x,
          'break' => $isBreak,
          'services' => isset($timeBlock['services']) ? $timeBlock['services'] : "all"
        ],
        'rendering' => 'background'
      ];

      $startTime = Carbon::parse($timeBlock['start_time']);
      $endTime = Carbon::parse($timeBlock['end_time']);
      $earliest = ($earliest->isBefore($startTime)) ? $earliest : $startTime;
      $latest = ($latest->isAfter($endTime)) ? $latest : $endTime;
      foreach ($timeBlock['days'] as $day => $include){
        if ($include){
          $scheduledDayNumerical = $map[$day];
          $scheduledDay = $today->copy()->subDays($todayNumerical - $scheduledDayNumerical);
          $newEvent['start'] = $scheduledDay->toDateString() . "T" . $startTime->toTimeString();
          $newEvent['end'] = $scheduledDay->toDateString() . "T" . $endTime->toTimeString();
          array_push($eventBlocks,$newEvent);
        }
      }
    }
    $eventBlocks = sortEventsByStart($eventBlocks);
    $eventBlocks = collapseSchedule($eventBlocks);
    return 
    [
      "eventBlocks" => $eventBlocks,
      'earliest' => $earliest,
      'latest' => $latest
    ];
  }
  function scheduleToFullCalBizHours($schedule){
      $bizHourArr = [];
      foreach ($schedule as $timeBlock){
          $daysOfWeek = [];
          if ($timeBlock['days']['Sunday']){$daysOfWeek[] = 0;}
          if ($timeBlock['days']['Monday']){$daysOfWeek[] = 1;}
          if ($timeBlock['days']['Tuesday']){$daysOfWeek[] = 2;}
          if ($timeBlock['days']['Wednesday']){$daysOfWeek[] = 3;}
          if ($timeBlock['days']['Thursday']){$daysOfWeek[] = 4;}
          if ($timeBlock['days']['Friday']){$daysOfWeek[] = 5;}
          if ($timeBlock['days']['Saturday']){$daysOfWeek[] = 6;}
          $startTime = to24HrTime($timeBlock['start_time']);
          $endTime = to24HrTime($timeBlock['end_time']);
          $bizHrObj = [
              'daysOfWeek' => $daysOfWeek,
              'startTime' => $startTime,
              'endTime' => $endTime,
              'rendering' => 'background'
          ];
          $bizHourArr[] = $bizHrObj;
      }
      return $bizHourArr;
  }
  function to24HrTime($str){
    return Carbon::createFromFormat("h:ia",$str)->toTimeString();
  }
  function sortEventsByStart($eventBlocks){
    usort($eventBlocks, 'compareStarts');
    return $eventBlocks;
  }
  function compareStarts($event1, $event2){
    $s1 = new Carbon($event1['start']);
    $s2 = new Carbon($event2['start']);
    if ($s1->equalTo($s2)){return 0;}
    elseif ($s1->lessThan($s2)){return -1;}
    elseif ($s1->greaterThan($s2)){return 1;}
  }
  function collapseSchedule($eventBlocks){
    $x = 0;
    while ($x < count($eventBlocks) - 1){
      $newBlocks = collapseBlocks($eventBlocks[$x], $eventBlocks[$x+1]);
      if (!$newBlocks){
        $x++;
      }else{
        array_splice($eventBlocks, $x, 2, $newBlocks);
      }
    }
    return $eventBlocks;
  }
  function collapseBlocks($block1,$block2){
    $conflictedServices = serviceConflict($block1, $block2);
    if (!timeOverlap($block1, $block2)){
      return false;
    }else{
      if (!$block1['extendedProps']['break'] && !$block2['extendedProps']['break'] && !$conflictedServices){
        return combineBlocks($block1, $block2);
      }elseif (!$block1['extendedProps']['break'] && !$block2['extendedProps']['break'] && $conflictedServices){
        return breakUpBlocks($block1, $block2);
      }elseif ($block1['extendedProps']['break'] || $block2['extendedProps']['break']){
        return breakUpBlocks($block1, $block2);
      }
    }
  }
  function combineBlocks($block1, $block2){
    $e1 = new Carbon($block1['end']);
    $e2 = new Carbon($block2['end']);
    $newArr = [];
    array_push($newArr,$block1);
    if ($e2->greaterThan($e1)){
      $newBlock = $block2;
      $newBlock['start'] = $block1['end'];
      array_push($newArr,$newBlock);      
    }
    return $newArr;
  }
  function breakUpBlocks($block1, $block2){
    $s1 = new Carbon($block1['start']);
    $s2 = new Carbon($block2['start']);
    $e1 = new Carbon($block1['end']);
    $e2 = new Carbon($block2['end']);
    $newArr = [];
    if ($s1->notEqualTo($s2)){
      $newBlock = $block1;
      $newBlock['end'] = $block2['start'];
      // echo "1";
      // var_dump($newBlock);
      array_push($newArr,$newBlock);
    }

    $newBlock = $block2;
    // var_dump($block2);
    if ($e1->lessThanOrEqualTo($e2)){$end = $block1['end'];}
    else {$end = $block2['end'];}
    $newBlock['end'] = $end;
    $services = serviceConflict($block1, $block2);
    if ($services == $block1['extendedProps']['services']){$blockNum = $block1['extendedProps']['block'];}
    elseif ($services == $block2['extendedProps']['services']){$blockNum = $block2['extendedProps']['block'];}
    if ($block2['extendedProps']['break']){$blockNum = $block2['extendedProps']['block'];}
    $newBlock['extendedProps']['services'] = $services;
    $newBlock['extendedProps']['block'] = $blockNum;

    // echo "2";
    // var_dump($newBlock);
    array_push($newArr,$newBlock);
    if ($e1->lessThan($e2)){
      $newBlock = $block2;
      $newBlock['start'] = $block1['end'];
      // echo "3";
      // var_dump($newBlock);
      array_push($newArr,$newBlock);
    }elseif ($e1->greaterThan($e2)){
      $newBlock = $block1;
      $newBlock['start'] = $block2['end'];
      // echo "4";
      // var_dump($newBlock);
      array_push($newArr,$newBlock);
    }
    return $newArr;
  }
  function subtractBlocks($block1, $block2){
    $s1 = new Carbon($block1['start']);
    $s2 = new Carbon($block2['start']);
    $e1 = new Carbon($block1['end']);
    $e2 = new Carbon($block2['end']);
    $newArr = [];
    if ($block1['extendedProps']['break'] && $e2->lessThanOrEqualTo($e1)){
      // FULL OVERLAP, NO TIMEBLOCKS RETURNED
    }elseif ($block1['extendedProps']['break'] && $e2->greaterThan($e1)){
      $newBlock = $block2;
      $newBlock['start'] = $block1['end'];
      array_push($newArr,$newBlock);
    }elseif ($block2['extendedProps']['break']){
      if ($s1->notEqualTo($s2)){
        $newBlock = $block1;
        $newBlock['end'] = $block2['start'];
        array_push($newArr,$newBlock);
      }
      if ($e2->lessThan($e1)){
        $newBlock = $block1;
        $newBlock['start'] = $block2['end'];
        array_push($newArr,$newBlock); 
      }
    }
    return $newArr;
  }
  function timeOverlap($block1, $block2){
    $s1 = new Carbon($block1['start']);
    $s2 = new Carbon($block2['start']);
    $e1 = new Carbon($block1['end']);
    $e2 = new Carbon($block2['end']);
    if ($e1->lessThanOrEqualTo($s2)){return false;}
    else {return true;}
  }
  function serviceConflict($block1, $block2){
    $services1 = $block1['extendedProps']['services'];
    $services2 = $block2['extendedProps']['services'];
    if ($services1 == $services2){
      return false;
    }elseif ($services1 == "all"){
      return $services2;
    }elseif ($services2 == "all"){
      return $services1;
    }else{
      return "SUPER CONFLICT";
    }
  }
  function eventConflict($momentObj, $duration, $practitionerId){

  }

// Model related functions
  function usesTrait($instance,$trait){
    $allTraits = class_uses($instance);
    $trait = 'App\Traits\\'.$trait;
    return ($allTraits!=false && isset($allTraits[$trait]));
  }
  function unsetUid($model){
    $uidList = session('uidList');
    unset($uidList[$model]);
    session(['uidList' => $uidList]);
    // Log::info(session('uidList'));
  }
  function setUid($model, $uid){
    $uidList = (session('uidList') !== null) ? session('uidList') : [];
    $uidList[$model]  = $uid;
    session(['uidList' => $uidList]);
    // Log::info(session("uidList"));
  }
  function getUid($model){
    if (session('uidList')===null){return null;}
    elseif (!isset(session('uidList')[$model])){return null;}
    else{return session('uidList')[$model];}
  }
  function dateFieldsArray(){return ['date_of_birth'];}
  function dateTimeFieldsArray(){return ['date_time'];}
  function isUser($model){
    return in_array($model,['Patient','Practitioner','StaffMember']);
  }
  function optionButtons($destinations,$btnText){
    echo "<div class='optionBtnWrap'>";
    for ($x=0;$x<count($destinations);$x++){
      echo "<div class='button xsmall purple70' data-destination='$destinations[$x]'>$btnText[$x]</div>";
    }
    echo "</div>";
  }
  function isCollection($var){
    if ($var instanceof Illuminate\Database\Eloquent\Collection){
      return true;
    }else{
      return false;
    }
  }
  function getNameFromUid($model,$uid){
    $c = "App\\$model";
    $instance = $c::find($uid);
    if ($instance){
      if (isset($instance->nameAttr)){
        $nameAttr = $instance->nameAttr;
        if (is_array($nameAttr)){
          $hasThrough = $nameAttr[1];
          $nameAttr = $nameAttr[0];
          $name = complexAttr($nameAttr,$instance,$hasThrough);
        }else{
          $name = complexAttr($nameAttr,$instance);
        }
      }else{
        $name = $instance->name;
      }
      // $name = (isset($instance->nameAttr)) ? complexAttr($instance->nameAttr,$instance) : $instance->name;
      return $name;
    }
    else {return "none";}
  }
  function findFormId($model){
    $id = "";
    if ($model == 'Service'){$id = '2';}
    // elseif ($model == 'User'){$id = '1';}
    elseif (in_array($model,['User','Patient','Practitioner','StaffMember'])){$id = '1';}
    elseif ($model == 'ServiceCategory'){$id = '3';}
    elseif ($model == 'Code'){$id = '4';}
    elseif ($model == 'Message'){$id = '12';}
    elseif ($model == 'Template'){$id = '15';}
    elseif ($model == 'Appointment'){
      // $id = (Auth::user()->user_type == "patient") ? '22' : '18';
      $id = "18";
    }
    elseif ($model == 'Complaint'){$id = '17';}
    elseif ($model == 'Diagnosis'){
      $id = (session('diagnosisType')=='Western') ? '5' : "11";
    }else{
      $id = null;
    }
    return $id;
  }
  function checkAliases($instance,$method){
      if (isset($instance->connectedModelAliases) and isset($instance->connectedModelAliases[$method])){
          $method = $instance->connectedModelAliases[$method];
      }
      return $method;
  }
  function extractEmbeddedImages($string,$instance,$attr){
      $embeddedImgs = [];
      $newImgs = preg_match_all('/src="data:([^;.]*);([^".]*)" data-filename="([^"]*)"/', $string, $newImgMatches, PREG_PATTERN_ORDER);
      $oldImgs = preg_match_all('/src="data:([^;.]*);([^".]*)" data-uuid="([^"]*)" data-filename="([^"]*)"/', $string, $oldImgMatches, PREG_PATTERN_ORDER);
      if ($newImgs!==false && $newImgs > 0){
          for ($x = 0; $x < count($newImgMatches[1]); $x++){
              $uuid = uuid();
              $fullMatch = $newImgMatches[0][$x];
              $mimeType = $newImgMatches[1][$x];
              $dataStr = $newImgMatches[2][$x];
              $fileName = $newImgMatches[3][$x];
              $embedStr = 'src="%%EMBEDDED:'.$uuid.'%%"';
              // array_push($embeddedImgs,[$uuid,$mimeType,$fileName,$dataStr]);
              array_push($embeddedImgs,$uuid);
              $string = str_replace($fullMatch,$embedStr,$string);

              $image = new Image;
              $image->id = $uuid;
              $image->mime_type = $mimeType;
              $image->file_name = $fileName;
              $image->data_string = $dataStr;
              $image->save();
          }
      }
      if ($oldImgs!==false && $oldImgs > 0){
          for ($x = 0; $x < count($oldImgMatches[1]); $x++){
              $fullMatch = $oldImgMatches[0][$x];
              $uuid = $oldImgMatches[3][$x];
              $embedStr = 'src="%%EMBEDDED:'.$uuid.'%%"';
              $string = str_replace($fullMatch,$embedStr,$string);
          }
      }
      $instance->$attr = $string;
      $returnVal = ($embeddedImgs == []) ? false : $embeddedImgs;
      return $returnVal;
  }

  function embeddedImgsToDataSrc($instanceWithImgs,$model){
    // UPDATES TO DISPLAY IMGS BUT DOESN'T SAVE IT
    $hasImages = ['Message','Template'];
    $attrsToCheck = [['message'],['markup']];
    $arrKey = array_search($model, $hasImages);
    if ($arrKey){
        foreach ($attrsToCheck[$arrKey] as $attr){
            $n = preg_match_all('/src="%%EMBEDDED:([^%]*)%%"/', $instanceWithImgs->$attr, $imgs, PREG_PATTERN_ORDER);
            $newAttrStr = false;
            if ($n!==false && $n > 0){
                for ($i = 0; $i < count($imgs[1]); $i++){
                    // $uuid = uuid();
                    $fullMatch = $imgs[0][$i];
                    $uuid = $imgs[1][$i];
                    $img = App\Image::find($uuid);
                    $mimeType = $img->mime_type; 
                    $dataStr = $img->data_string;
                    $fileName = $img->file_name;
                    $imgStr = 'src="data:'.$mimeType.';'.$dataStr.'" data-uuid="'.$uuid.'" data-filename="'.$fileName.'"';
                    $newAttrStr = $newAttrStr ? $newAttrStr : $instanceWithImgs->$attr;
                    $newAttrStr = str_replace($fullMatch,$imgStr,$newAttrStr);
                }
                $instanceWithImgs->$attr = $newAttrStr;
            }
        }
    }
  }
  function embeddedImgsToCIDSrc($messageStr){
    // RETURNS A STRING
            $n = preg_match_all('/"%%EMBEDDED:([^%]*)%%"/', $messageStr, $imgs, PREG_PATTERN_ORDER);
            $newMsgStr = false;
            $dataArr = [];
            if ($n!==false && $n > 0){
                for ($i = 0; $i < count($imgs[1]); $i++){
                    $uuid = uuid();
                    $fullMatch = $imgs[0][$i];
                    $uuid = $imgs[1][$i];
                    $img = App\Image::find($uuid);
                    $mimeType = $img->mime_type; 
                    $dataStr = $img->data_string;
                    $fileName = $img->file_name;
                    // $imgStr = '"{{ $message->embedData('.$dataStr.','.$uuid.') }}"';
                    $newMsgStr = $newMsgStr ? $newMsgStr : $messageStr;
                    // $newMsgStr = str_replace($fullMatch,$imgStr,$newMsgStr);
                    $newMsgStr = str_replace($fullMatch,"%%REPLACE%%",$newMsgStr);
                    array_push($dataArr, [$dataStr,$uuid]);
                }
            }else{
              $newMsgStr = $messageStr;
            }
            $newMsgArr = explode("%%REPLACE%%",$newMsgStr);
            return [$newMsgArr,$dataArr];
  }

  // FUCK YEAH
  // this function takes any string with %attr_names% and replaces them with values
  // similarly takes any string with this format
  //  
  //       conditionalAttr     !!     any string including %attr_names%     !!      any string including %attr_names%
  //
  // and retrieves the first value if the 1st argument exists and is not null
  //
  //       OR simply any string with %attr_names%
  // 
  function complexAttr($str,$instance,$hasThrough = null){
    if ($hasThrough == null){
      if (strpos($str,"!!") > -1){
        $arr = explode("!!",$str);
        $conditionalAttr = $arr[0];
        $true = $arr[1];
        $false = $arr[2];
        $str = (isset($instance->$conditionalAttr) and $instance->$conditionalAttr != null) ? $true : $false;
      }
      if (strpos($str,"%") > -1){
        $attr = "";
        $arr = explode("%",$str);
        for ($x = 0; $x < count($arr); $x++){
          if (isOdd($x)){
            $attrName = $arr[$x];
            $attr .= $instance->$attrName;
          }
          if (isEven($x)){
            $attr .= $arr[$x];
          }
        }
      }else{
        $attr = $instance->$str;
      }
    }else{
      if (strpos($str,"!!") > -1){
        $arr = explode("!!",$str);
        $conditionalAttr = $arr[0];
        $true = $arr[1];
        $false = $arr[2];
        $str = (isset($instance->$hasThrough->$conditionalAttr) and $instance->$hasThrough->$conditionalAttr != null) ? $true : $false;
      }
      if (strpos($str,"%") > -1){
        $attr = "";
        $arr = explode("%",$str);
        for ($x = 0; $x < count($arr); $x++){
          if (isOdd($x)){
            $attrName = $arr[$x];
            $attr .= $instance->$hasThrough->$attrName;
          }
          if (isEven($x)){
            $attr .= $arr[$x];
          }
        }
      }else{
        $attr = $instance->$hasThrough->$str;
      }
    }
    return $attr;
  }

// Bug functions
  function reportBug($description, $details = null, $category = null, $location = null, User $user = null){
    $bug = new Bug;
    $bug->description = title($description);
    $bug->details = $details;
    $bug->location = $location;
    $bug->category = title($category);
    $bug->user_id = $user ? $user->id : null;
    $bug->status = ['opened' => Carbon::now()->timestamp];
    $bug->save();
  }

// Email functions 
    function asJSON($data){
        $json = json_encode($data);
        $json = preg_replace('/(["\]}])([,:])(["\[{])/', '$1$2 $3', $json);

        return $json;
    }
    function asString($data){
        $json = asJSON($data);
        return wordwrap($json, 76, "\n   ");
    }    
    function lastInArray($array){
      $count = count($array);
      return $count > 0 ? $array[$count - 1] : null;
    }

// Practice functions
  function setActiveStorage($key,$value){
    $active = Storage::disk('local')->get('active.json');
    $active = json_decode($active,true);
    $active[$key] = $value;
    Storage::disk('local')->put('active.json',json_encode($active));
  }
  function getActiveStorage($key){
    $active = Storage::disk('local')->get('active.json');
    $active = json_decode($active,true);
    return $active[$key];
  }
  function practiceConfig($path){
    throw new Exception('using practiceConfig');
  }
  function addToConfig($configName,$key,$value){
    throw new Exception('using addToConfig');
  }
  function removeFromConfig($configName,$key){
    throw new Exception('using removeFromConfig');
  }
  function writeConfig($newData,$fileName){
    throw new Exception('using writeConfig');
  }

  function getPracticeId(Request $request){
    throw new Exception('using getPracticeId');
  }
?>

