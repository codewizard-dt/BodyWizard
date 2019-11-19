<?php
use App\Form;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

$questions = Auth::user()->security_questions;

$securityQuestion = [
	"ID*secQuestion1",
	"What is your maternal grandmother's maiden name?",
	"What is your paternal grandmother's maiden name?",
	"What was the name of your first pet?",
	"What was the make and model of your first car?",
	"What is the first name of the first person you kissed?",
	"What is the first and last name of your first significant partner?",
	"What is the last name of the teacher who gave you your first failing grade?"
];
$textOptions = [
	"name" => 'secAnswer1',
	'placeholder' => 'your response (not case sensitive)'
];
$confirmOptions = [
	"name" => 'secAnswer1c',
	'placeholder' => 'confirm your response'
];
$ctrl = new Form();

?>

@if ($questions != null)
<div id="CurrentQuestions">
	@foreach ($questions as $q => $a)
		<h3>{{$q}}</h3>
		<div>***********</div>
	@endforeach
	<div class="button change pink70">change questions</div>
</div>
@endif

<div id='SecurityQuestion1' class='secQ'>
	<h4>First Question</h4>
	{{ $ctrl->answerDisp('dropdown',$securityQuestion) }}
	{{ $ctrl->answerDisp('text',$textOptions) }}
	{{ $ctrl->answerDisp('text',$confirmOptions) }}
</div>
<?php $securityQuestion[0] = "ID*secQuestion2"; $textOptions['name'] ='secAnswer2'; $confirmOptions['name'] = 'secAnswer2c';?>
<div id='SecurityQuestion2' class='secQ'>
	<h4>Second Question</h4>
	{{ $ctrl->answerDisp('dropdown',$securityQuestion) }}
	{{ $ctrl->answerDisp('text',$textOptions) }}
	{{ $ctrl->answerDisp('text',$confirmOptions) }}
</div>
<?php $securityQuestion[0] = "ID*secQuestion3"; $textOptions['name'] ='secAnswer3'; $confirmOptions['name'] = 'secAnswer3c'; ?>
<div id='SecurityQuestion3' class='secQ'>
	<h4>Third Question</h4>
	{{ $ctrl->answerDisp('dropdown',$securityQuestion) }}
	{{ $ctrl->answerDisp('text',$textOptions) }}
	{{ $ctrl->answerDisp('text',$confirmOptions) }}
</div>
<div class='button small submit pink'>submit</div>

<script type="text/javascript" src="{{ asset('/js/security/change-security-questions.js') }}"></script>
