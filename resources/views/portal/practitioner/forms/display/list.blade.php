<?php
use App\Service;
use App\Form;
$forms = Form::all();

$uid = session('form_uid') !== null ? session('form_uid') : null;
// dd(session('form_uid'));
?>

<h2 class="p-y-xsmall">Available Forms</h2>

<?php
$destinations = ['forms-select'];
$btnText = ['select a form'];
if ($uid) {
    $destinations = ['forms-settings', 'form-preview', 'forms-edit', 'forms-delete', 'forms-create'];
    $btnText = ['settings', 'preview', 'edit', 'delete', 'create new form'];
}
?>
@include('models.optionsNav',[
'destinations'=>$destinations,
'btnText'=>$btnText,
'model'=>'Form'
])

<?php
$formCtrl = new Form();
$options = $formCtrl->TableOptions;
$options['collection'] = Form::all();
$options['model'] = 'Form';
// dd(Form::all()->first());
?>
@include('models.table', $options)


<script src="{{ asset('/js/launchpad/forms.js') }}"></script>
<script src="{{ asset('/js/launchpad/form-list.js') }}"></script>
