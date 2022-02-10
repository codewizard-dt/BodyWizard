@foreach ($models as $model)
    <?php $class = "App\\$model"; ?>
    <div class="list_update" data-model="{{ $model }}" data-list="{{ json_encode($class::get_list()) }}">
    </div>
@endforeach
