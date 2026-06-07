<?php

namespace App\Http\Requests;

use App\Models\Patient;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Patient::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Link to existing patient-role user (required)
            'user_id' => ['required', 'integer', 'exists:users,id'],

            // Patient core fields
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:M,F'],
            'phone' => ['required', 'string', 'max:33'],
            'address' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:33'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'emergency_contact_name' => ['required', 'string', 'max:100'],
            'emergency_contact_phone' => ['required', 'string', 'max:50'],
            'blood_type' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'allergies' => ['nullable', 'string'],
            'medical_notes' => ['nullable', 'string'],

            // Socioeconomic fields (all optional on create)
            ...self::socioeconomicRules('nullable'),
        ];
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public static function socioeconomicRules(string $prefix = 'nullable'): array
    {
        $key = fn (string $field) => "socioeconomic.{$field}";

        return [
            'socioeconomic' => ["{$prefix}", 'array'],
            $key('marital_status') => ["{$prefix}", 'in:single,married,divorced,widowed,separated,other'],
            $key('number_of_dependents') => ["{$prefix}", 'integer', 'min:0', 'max:20'],
            $key('living_arrangement') => ["{$prefix}", 'in:alone,with_family,with_partner,shared_housing,care_facility,other'],
            $key('employment_status') => ["{$prefix}", 'in:employed_full_time,employed_part_time,self_employed,unemployed,retired,student,unable_to_work,other'],
            $key('occupation') => ["{$prefix}", 'string', 'max:255'],
            $key('income_level') => ["{$prefix}", 'in:low,lower_middle,middle,upper_middle,high'],
            $key('has_health_insurance') => ["{$prefix}", 'boolean'],
            $key('education_level') => ["{$prefix}", 'in:no_formal,primary,secondary,vocational,bachelors,masters,doctorate,other'],
            $key('smoking_status') => ["{$prefix}", 'in:never,former,current_light,current_heavy'],
            $key('alcohol_consumption') => ["{$prefix}", 'in:none,occasional,moderate,heavy'],
            $key('physical_activity_level') => ["{$prefix}", 'in:sedentary,lightly_active,moderately_active,very_active'],
            $key('has_family_support') => ["{$prefix}", 'boolean'],
            $key('has_caregiver') => ["{$prefix}", 'boolean'],
            $key('transportation_access') => ["{$prefix}", 'in:own_vehicle,public_transport,rideshare,walking,limited,none'],
            $key('food_security_status') => ["{$prefix}", 'in:food_secure,marginally_secure,food_insecure,severely_insecure'],
            $key('dietary_restrictions_cultural') => ["{$prefix}", 'string', 'max:500'],
            $key('additional_notes') => ["{$prefix}", 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public static function socioeconomicRulesForUpdate(): array
    {
        $rules = self::socioeconomicRules('nullable');
        $updateRules = [];

        foreach ($rules as $key => $rule) {
            $updateRules[$key] = array_merge(['sometimes'], $rule);
        }

        return $updateRules;
    }
}
