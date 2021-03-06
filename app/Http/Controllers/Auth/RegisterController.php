<?php

namespace App\Http\Controllers\Auth;

use App\User;
use App\Patient;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Carbon;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/checkmark';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:5', 'max:255', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    // protected function create(array $data)
    protected function create(array $data)
    {
        $dob = Carbon::parse($data['date_of_birth'])->toDateString();
        $user = new User();
        $user->first_name = $data['first_name'];
        $user->middle_name = $data['middle_name'];
        $user->last_name = $data['last_name'];
        $user->preferred_name = $data['preferred_name'];
        $user->phone = $data['phone'];
        $user->date_of_birth = $dob;
        $user->username = $data['username'];
        $user->full_json = $data['full_json'];
        $user->email = $data['email'];
        $user->password = Hash::make($data['password']);
        $user->save();
        $patient = new Patient;
        $patient->user_id = $user->id;
        $patient->save();
        return $user;
    }
}
