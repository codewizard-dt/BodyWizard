<?php 

use App\Form;
use App\User;

include_once app_path("php/functions.php");

$changePwForm = Form::find(22);

?>

</div>
<div class="central">
	{{ $changePwForm->formDisplay() }}
</div>

<script type="text/javascript" src="{{ asset('/js/security/change-password.js') }}"></script>
