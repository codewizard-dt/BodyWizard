<?php 

?>

<!DOCTYPE html>
<html>
<head>
	<title>Jankyoke List Helper</title>
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/app.css') }} ">
</head>
<body>
	<h1>Jankyoke List Helper App</h1>
	<h3 id='karaoke_load'>loading...</h3>
	<div>
		@include('/layouts/forms/display/answer',[
			'name' => 'user_list',
			'id' => 'user_list',
			'type' => 'text',
			'options' => [
				'placeholder' => 'Add new Janky Star',
				'ele_css' => [
					'minWidth' => '300px'
				],
				'on_enter_action' => 'JankyStar.add_to_list',
				'after_load_action' => 'JankyStar.ready'
			]
		])		
	</div>
	<div>
		<div id="AddButton" class="button xsmall pink70" data-action='JankyStar.add_to_list'>add to list</div>			
	</div>
	<div id='ModalHome'></div>
	<footer>
    <script type='text/javascript' src="{{asset('/js/app.js')}}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js" integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="{{asset('/js/jquery.plugin.min.js')}}"></script>
	</footer>
</body>
</html>