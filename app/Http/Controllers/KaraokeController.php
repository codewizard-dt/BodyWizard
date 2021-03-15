<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class KaraokeController extends Controller
{
	public function stack () {
		return view('karaoke.stack');
	}
}
