<div class='wrapMe marginBig bottomOnly' style='display:inline-block'>

    <?php
    $nospaces = str_replace(' ', '', $model);
    ?>

    <table id='SingleScheduleTable' class='styled-table clickable scheduleTable' data-model='{{ $nospaces }}'
        data-hideorder="services">

        <tr class='head'>
            <th class='days'>Scheduled Days</th>
            <th class='hours'>Hours</th>
            @if ($model == 'Practitioner')
                <th class='services'>Services Offered</th>
            @endif
        </tr>
        @foreach ($schedule as $timeBlock)
            <?php
            $hiddenFiltersAdded = false;
            $timeBlock['break'] = isset($timeBlock['break']) ? $timeBlock['break'] : false;
            $isBreak = $timeBlock['break'] ? 'breakTime' : '';
            ?>
            <tr class='timeBlock {{ $isBreak }}' data-block='{{ $loop->index }}'>
                <td class='days'>
                    <div class='td_size_control'>{{ displayDays($timeBlock['days']) }}<div class='indicator'>...</div>
                    </div>
                </td>
                <td class='hours'>
                    <div class='td_size_control'>{{ $timeBlock['start_time'] }} to {{ $timeBlock['end_time'] }}<div
                            class='indicator'>...</div>
                    </div>
                </td>
                @if ($model == 'Practitioner')
                    <td class='services'>
                        <div class='td_size_control'>
                            @if (isset($timeBlock['services']))
                                <?php
                                $str = '';
                                for ($x = 0; $x < count($timeBlock['services']); $x++) {
                                    $str .= getNameFromUid('Service', $timeBlock['services'][$x]);
                                    if ($x < count($timeBlock['services']) - 1) {
                                        $str .= ', ';
                                    }
                                }
                                echo $str;
                                ?>
                            @elseif ($isBreak)
                                break time!
                            @else
                                All Available Services
                            @endif
                            <div class='indicator'>...</div>
                        </div>
                    </td>
                @endif
            </tr>
        @endforeach

        <tr class='noMatch'>
            <td class='days'>
                <div class='td_size_control'>No Scheduled Time Blocks<div class='indicator'>...</div>
                </div>
            </td>
            <td class='hours'>
                <div class='td_size_control'>
                    <div class='indicator'>...</div>
                </div>
            </td>
            <td class='services'>
                <div class='td_size_control'>
                    <div class='indicator'>...</div>
                </div>
            </td>
        </tr>
    </table>
</div>
