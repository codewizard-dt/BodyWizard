<?php
$includeConnectedModals = isset($includeConnectedModals) ? $includeConnectedModals : false;
?>
@include('models.edit',['model'=>$model,'modal'=>true,'includeConnectedModals'=>$includeConnectedModals])