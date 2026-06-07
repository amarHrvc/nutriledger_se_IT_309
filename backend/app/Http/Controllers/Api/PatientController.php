<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Http\Resources\Api\PatientResource;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends ApiController
{
    private PatientService $patientService;

    public function __construct(PatientService $patientService)
    {
        $this->patientService = $patientService;
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Patient::class);

        $query = $request->user()->isAdmin()
            ? Patient::withTrashed()
            : Patient::query();

        $query->with(['socioeconomic', 'user']);

        if ($request->user()->isPatient()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $terms = preg_split('/\s+/', $search, 2, PREG_SPLIT_NO_EMPTY);

            if (count($terms) === 2) {
                [$first, $last] = $terms;
                $query->where(function ($builder) use ($first, $last) {
                    $builder->where('first_name', 'like', "%{$first}%")
                        ->where('last_name', 'like', "%{$last}%");
                });
            } else {
                $query->where(function ($builder) use ($search) {
                    $builder->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            }
        }

        return $this->paginated('Patients retrieved successfully.', PatientResource::collection($query->paginate()));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @throws \Throwable
     */
    public function store(StorePatientRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $patientData = collect($validated)->except(['socioeconomic'])->toArray();

        $patient = $this->patientService->createPatient(
            $patientData,
            $validated['socioeconomic'] ?? null
        );

        return $this->created('Patient created successfully.',
            ['patient' => new PatientResource($patient)]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $patient): JsonResponse
    {
        $model = $request->user()->isAdmin()
            ? Patient::withTrashed()->findOrFail($patient)
            : Patient::findOrFail($patient);

        $this->authorize('view', $model);

        return $this->ok('Patient retrieved successfully.',
            ['patient' => new PatientResource($model->load(['socioeconomic', 'user']))]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @throws \Throwable
     */
    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $updatePatient = $this->patientService->updatePatient(
            $patient,
            collect($request->validated())->except(['socioeconomic'])->toArray(),
            $request->validated()['socioeconomic'] ?? null
        );

        return $this->ok('Patient updated successfully.', ['patient' => new PatientResource($updatePatient)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient): JsonResponse
    {
        $this->authorize('delete', $patient);
        $patient->delete();

        return $this->noContent();
    }

    public function restore(string $id): JsonResponse
    {
        $patient = Patient::withTrashed()->findOrFail($id);

        $this->authorize('restore', $patient);

        $patient->restore();

        return $this->ok('Patient restored successfully.', [
            'patient' => new PatientResource($patient->fresh()->load(['socioeconomic', 'user'])),
        ]);
    }
}
