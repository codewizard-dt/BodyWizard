@foreach ($models as $model)
    <?php $class = "App\\$model"; ?>
    <div class="list_update" data-model="{{ $model }}" data-list="{{ $class::get_list(true) }}"></div>
@endforeach
