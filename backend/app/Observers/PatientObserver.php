<?php

namespace App\Observers;

use App\Models\Patient;
use Illuminate\Support\Facades\Log;

class PatientObserver
{
    public function created(Patient $patient): void
    {
        Log::info('Patient record created', [
            'patient_id' => $patient->id,
            'user_id' => $patient->user_id,
            'full_name' => $patient->full_name,
            'actor_id' => auth()->id(),
        ]);
    }

    public function deleted(Patient $patient): void
    {
        Log::warning('Patient record deleted', [
            'patient_id' => $patient->id,
            'user_id' => $patient->user_id,
            'full_name' => $patient->full_name,
            'actor_id' => auth()->id(),
        ]);

        $patient->loadMissing('user');

        if ($patient->user) {
            Log::info('Patient deletion notification queued', [
                'patient_id' => $patient->id,
                'notify_user_id' => $patient->user->id,
                'notify_email' => $patient->user->email,
            ]);
        }
    }
}
