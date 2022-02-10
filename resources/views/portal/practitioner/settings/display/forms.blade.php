<?php
use App\Form;
$forms = Form::where('hidden', '0')
    ->with('services')
    ->orderBy('display_order')
    ->get();
?>
<h1 class="purple">Form Display Settings</h1>
<div class="displayOrder p-y-xsmall">
    <div class='paddedSides'>
        <h2>Display Order</h2>
        <div>These settings determine display order throughout the portal and website.</div>
    </div>
    <div class="column paddedSides">
        <h3>Available Portal Forms</h3>
        <ul class="displayList" data-model='Form'>

            @foreach ($forms as $form)
                <li data-target='service' data-uid='{{ $form->form_uid }}'><span
                        class="name">{{ $form->name }}</span>
                    <div class="UpDown">
                        <div class="up"></div>
                        <div class="down"></div>
                    </div>
                </li>
            @endforeach
        </ul>
    </div>
    <div class="column paddedSides">

    </div>
</div>
<div id="AutoSaveWrap" class="wrapper">
    <div id="AutoConfirm"><span class='message'>settings autosaved</span><span style="margin-left:10px"
            class="checkmark">✓</span></div>
</div>

<script type="text/javascript" src="{{ asset('/js/display-settings.js') }}"></script>
