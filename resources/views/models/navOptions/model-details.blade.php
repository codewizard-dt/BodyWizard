<div class='flexbox column inline'>
  @foreach ($details as $attr => $value)
  <?php if (is_array($value) || is_object($value)) throw new \Exception("values passed to 'modelDetails' must be a string, '$attr' is ".gettype($value)) ; ?>
  <div>
    <div class="key">{{title($attr)}}: </div>
    <div class="value">{!!$value!!}</div>
  </div>
  @endforeach
</div>