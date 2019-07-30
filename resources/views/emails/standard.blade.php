<?php 
use App\Image;
use Illuminate\Support\Facades\Log;

?>

@extends('layouts.email.basic')

@section('content')
	<?php 
		$result = embeddedImgsToCIDSrc($data->message);
		$markup = $result[0];
		$imgs = $result[1];
	?>
	
	{!! $markup[0] !!}
	@forelse($imgs as $img)
		<?php $c = $loop->index; ?>
		{{ $message->embedData(base64_decode(str_replace("base64,","",$img[0])),$img[1]) }}
		{!! $markup[$c + 1] !!}
	@empty
	@endforelse

@endsection