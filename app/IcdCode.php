<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use App\Traits\TableAccess;
use App\Traits\HasSettings;

class IcdCode extends Model
{
    use TableAccess;
    use HasSettings;

    protected $guarded = [];

    public static function displayName()
    {return 'ICD Code';}
    public static function TableOptions()
    {
        return array(
            'columns' => [
                'Code' => 'code',
                'Title' => 'title',
                'Text' => 'text',
            ],
            'hideOrder' => [],
            'filters' => [],
            'extraBtns' => [],
            'extraData' => [],
        );

    }
    public function getNameAttribute()
    {
        // $text = $this->text === null ? $this->title : $this->text;
        return $this->code . ' - ' . $this->title;
    }
    public function mappedUrlLinks()
    {
        $codes = preg_split('/(\/|&)/', $this->code);
        $urls = collect(explode(' & ', $this->url));
        $urls = $urls->map(function ($url, $i) use ($codes) {
            $text = $codes[$i];
            return "<a target='new_window' href='https://icd.who.int/browse11/f/en#/$url'>$text</a>";
            // return link($url, $codes[$i]);
        })->all();

    }
    public function details()
    {
        function link($url, $text)
        {
            return "<a target='new_window' href='https://icd.who.int/browse11/f/en#/$url'>$text</a>";
        }
        $urls = collect(explode(' & ', $this->url));
        $codes = preg_split('/(\/|&)/', $this->code);
        $urls = $urls->map(function ($url, $i) use ($codes) {return link($url, $codes[$i]);})->all();
        return [
            'Code' => $this->code,
            'Title' => $this->title,
            'Text' => $this->text,
            'More Info' => implode(', ', $urls),
        ];
    }
}
