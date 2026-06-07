export const PATIENTS_NAV = {
  icon: 'tabler-users',
  staffLabel: 'Patients',
  patientLabel: 'My Record'
} as const

export function getPatientsNavLabel(isPatient: boolean): string {
  return isPatient ? PATIENTS_NAV.patientLabel : PATIENTS_NAV.staffLabel
}
