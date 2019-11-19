<?php

namespace App;

use App\User;
use App\Patient;
use App\StaffMember;
use App\Practitioner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;


class RefreshTables extends Model
{
    //
    public function clearUserTables(){
    	try{
			Artisan::call("migrate:refresh --path database/migrations/2014_10_12_000000_create_users_table.php");
			Artisan::call("migrate:refresh --path database/migrations/2019_08_15_103817_create_users_audit_table.php");
			Artisan::call("migrate:refresh --path database/migrations/2019_08_14_203443_create_practitioners_table.php");
			Artisan::call("migrate:refresh --path database/migrations/2019_08_20_095146_create_practitioners_audit_table.php");
			Artisan::call("migrate:refresh --path database/migrations/2019_08_14_132627_create_staff_members_table.php");
			Artisan::call("migrate:refresh --path database/migrations/2019_08_20_095244_create_staff_members_audit_table.php");
			Artisan::call("migrate:refresh --path database/migrations/2019_08_14_132458_create_patients_table.php");
			Artisan::call("migrate:refresh --path database/migrations/2019_08_20_095220_create_patients_audit_table.php");
			return true;
    	}catch(\Exception $e){
    		return $e;
    	}
    }
    public function clearApptTables(){
        try{
            Artisan::call("migrate:refresh --path database/migrations/2019_05_29_164721_create_appointments_table.php");
            Artisan::call("migrate:refresh --path database/migrations/2019_09_16_163133_create_appointments_audit_table.php");
            Artisan::call("migrate:refresh --path database/migrations/2019_09_18_132210_create_appointmentables_table.php");
            return true;
        }catch(\Exception $e){
            return $e;
        }
    }
    public function createDefaultUser(){
    	try{
		    $admin = new User;
		    $admin->first_name = "Bryan";
		    $admin->middle_name = "David";
		    $admin->last_name = "Taylor";
		    $admin->preferred_name = "David";
		    $admin->user_type = "practitioner";
            $admin->is_admin = 1;
            $admin->require_new_pw = 0;
            $admin->security_questions = null;
		    $admin->username = "david";
		    $admin->date_of_birth = '1985-10-14';
		    $admin->email = "david@bodywizardmedicine.com";
		    $admin->phone = "512-514-3706";
		    $admin->password = '$2y$10$chX/ZsWKiiEaLrI59N5nkuYYb.VZi9WXEf53DPmq.ko1iIGZVjyt2';
		    $admin->full_json = '{"Sections": [{"Name": "Personal Information", "Items": [{"type": "date", "question": "Date of Birth", "response": ["10/14/1985"]}, {"type": "text", "question": "First Name", "response": ["Bryan"]}, {"type": "text", "question": "Middle Name", "response": ["David"]}, {"type": "text", "question": "Last Name", "response": ["Taylor"]}, {"type": "text", "question": "Preferred Name", "response": ["David"]}]}, {"Name": "Contact Information", "Items": [{"type": "text", "question": "Phone Number", "response": ["5125143706"]}, {"type": "text", "question": "Email Address", "response": ["david@bodywizardmedicine.com"]}]}, {"Name": "Login Information", "Items": [{"type": "narrative", "question": "", "response": []}, {"type": "text", "question": "Username", "response": ["david"]}, {"type": "text", "question": "Password", "response": []}, {"type": "text", "question": "Confirm Password", "response": []}]}]}';
    		$admin->save();
	        $practitioner = new Practitioner;
	        $practitioner->user_id = $admin->id;
	        $practitioner->save();
			return true;
    	}catch(\Exception $e){
    		return $e;
    	}
    }
    public function seedUserTables(){
        $patients = factory(Patient::class,15)
                    ->create()
                    ->each(function($patient){
                        $patient->userInfo()->associate(
                        	factory(User::class)->states('patient')->create()
                        )->save();
                    });
        $practitioners = factory(Practitioner::class,3)
                    ->create()
                    ->each(function($practitioner){
                        $practitioner->userInfo()->associate(
                        	factory(User::class)->states('practitioner')->create()
                        )->save();
                    });
        $staffMembers = factory(StaffMember::class,2)
                    ->create()
                    ->each(function($staffMember){
                        $staffMember->userInfo()->associate(
                        	factory(User::class)->states('staff member')->create()
                        )->save();
                    });
    }
    public function seedApptTables($calendarId, $apptCount){
        $apptCount = (int)$apptCount;
        try{
            $appts = factory(Appointment::class, $apptCount)
                     ->create();
            return true;
        }catch(\Exception $e){
            Log::info($e);
            return false;
        }

    }
}
