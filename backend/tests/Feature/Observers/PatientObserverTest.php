<?php

use App\Models\Patient;
use App\Models\User;
use App\Observers\PatientObserver;
use Illuminate\Support\Facades\Log;

test('patient observer logs when a patient is created', function () {
    Log::spy();

    $patient = Patient::factory()->make([
        'id' => 1,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
    ]);

    (new PatientObserver)->created($patient);

    Log::shouldHaveReceived('info')
        ->once()
        ->with('Patient record created', Mockery::on(function (array $context) {
            return ($context['patient_id'] ?? null) === 1
                && ($context['full_name'] ?? null) === 'Jane Doe';
        }));
});

test('patient observer logs and notifies when a patient is deleted', function () {
    Log::spy();

    $user = User::factory()->make(['id' => 10, 'email' => 'patient@example.com']);
    $patient = Patient::factory()->make([
        'id' => 5,
        'user_id' => 10,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
    ]);
    $patient->setRelation('user', $user);

    (new PatientObserver)->deleted($patient);

    Log::shouldHaveReceived('warning')
        ->once()
        ->with('Patient record deleted', Mockery::on(function (array $context) {
            return ($context['patient_id'] ?? null) === 5;
        }));

    Log::shouldHaveReceived('info')
        ->once()
        ->with('Patient deletion notification queued', Mockery::on(function (array $context) {
            return ($context['patient_id'] ?? null) === 5
                && ($context['notify_user_id'] ?? null) === 10
                && ($context['notify_email'] ?? null) === 'patient@example.com';
        }));
});

test('patient observer is registered on the patient model', function () {
    $patient = Patient::withoutEvents(fn () => Patient::factory()->create());

    Log::spy();

    $patient->delete();

    Log::shouldHaveReceived('warning')
        ->once()
        ->with('Patient record deleted', Mockery::type('array'));
});
