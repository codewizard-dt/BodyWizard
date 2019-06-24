<?php
use Illuminate\Support\Str;

// String related functions
  function plural($str){
    return Str::plural($str);
  }
  function singular($str){
    return Str::singular($str);
  }
  function snake($str){
    return Str::snake($str);
  }
  function camel($str){
    return Str::camel($str);
  }
  function contains($str){
    return Str::contains($str);
  }
  function uuid(){
    return Str::uuid();
  }


  function isEven($num){
    return $num % 2 == 0;
  }
  function isOdd($num){
    return $num % 2 == 1;
  }
  function boolToYN(bool $bool){
    return $bool ? "yes" : "no";
  }

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
        $data = htmlspecialchars($data);
        return $data;
      }
  }
  function removepunctuation($data){
        $data = str_replace('?', '', $data);
        $data = str_replace('!', '', $data);
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
  function removenull($data){
      $key = array_search('-',$data);
      if ($key>0){
          unset($data[$key]);
      }
      return $data;
  }
  function formatDate($date){
      $formatDate = date_create($date);
      $formatDate = date_format($formatDate,"M j, Y");
      return $formatDate;
  }
  function painbox($xP,$yP,$bodypart){
      $xP=$xP-3 ;
      $yP=$yP-1;
      echo '<div class="painbox" style="left:'.$xP.'px;top:'.$yP.'px;" data-bodypart="'.$bodypart.'"><div class="paincircle show"></div></div>';
  }

// Model related functions
  function optionButtons($destinations,$btnText){
    for ($x=0;$x<count($destinations);$x++){
      echo "<div class='button xsmall' data-destination='$destinations[$x]'>$btnText[$x]</div>";
    }
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
      $name = (isset($instance->nameAttr)) ? complexAttr($instance->nameAttr,$instance) : $instance->name;
      return $name;
    }
    else {return "none";}
  }

  function findFormId($model){
    $id = "";
    if ($model == 'Service'){$id = '2';}
    elseif ($model == 'User'){$id = '1';}
    elseif ($model == 'ServiceCategory'){$id = '3';}
    elseif ($model == 'Code'){$id = '4';}
    elseif ($model == 'Message'){$id = '12';}
    elseif ($model == 'Diagnosis'){
      $id = (session('diagnosisType')=='Western') ? '5' : "11";
    }
    return $id;
  }

  function checkAliases($instance,$method){
      if (isset($instance->connectedModelAliases) and isset($instance->connectedModelAliases[$method])){
          $method = $instance->connectedModelAliases[$method];
      }
      return $method;
  }

  // FUCK YEAH
  // this function takes any string with %attr_names% and replaces them with values
  // similarly takes any string with this format
  //  
  //       conditionalAttr     !!     any string including %attr_names%     !!      any string including %attr_names%
  //
  // and retrieves the first value if the 1st argument exists and is not null
  function complexAttr($str,$instance){
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
    return $attr;
  }

?>