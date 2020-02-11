<?php
$height = isset($height) ? $height : 'null';
$imageInfo = getimagesize(public_path($image));
$ratio = $imageInfo[0] / $imageInfo[1];
?>
<div class="answer imageClick {{$name}}" style='background-image:url("{{$image}}")' data-height='{{$height}}' data-ratio='{{$ratio}}'>
	<div class="button xsmall pink70 undo">undo</div>
</div>