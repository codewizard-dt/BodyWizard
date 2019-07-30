<?php
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Image;



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
  function title($str){
    return Str::title($str);
  }
  function contains($str){
    return Str::contains($str);
  }
  function uuid(){
    return Str::orderedUuid()->toString();
  }
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
    elseif ($model == 'Template'){$id = '15';}
    elseif ($model == 'Complaint'){$id = '17';}
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
    // Log::info($arrKey);
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
                // Log::info($imgInstance->$attr);
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
    function decodeStatus($string){
      $status = json_decode($string,true);
      if ($status['open']){
        $returnVal = ['Last opened at ',lastInArray($status['open'])];
      }elseif ($status['delivered']){
        $returnVal = ['Delivered at ',lastInArray($status['delivered'])];
      }elseif ($status['processed']){
        $returnVal = ['Processed at ',lastInArray($status['processed'])];
      }elseif ($status['bounce']){
        $returnVal = ['Undeliverable at ',lastInArray($status['bounce'])];
      }elseif ($status['dropped']){
        $returnVal = ['Dropped at ',lastInArray($status['dropped'])];
      }elseif ($status['pending']){
        $returnVal = ['Sent at ',lastInArray($status['pending'])];
      }
      $returnVal[1] = date("g:ia n/j/y",$returnVal[1]);
      return implode("", $returnVal);
    }
    function lastInArray($array){
      $count = count($array);
      return $array[$count - 1];
    }
?>