'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { patientsShow } from '@/api/generated/patient/patient'
import { patientsVisitsShow } from '@/api/generated/visit/visit'
import VisitDetail from '@views/visits/VisitDetail'
import PatientDetailsCard from '@views/patients/patient-left/PatientDetailsCard'
import type { PatientResource, VisitResource } from '@/api/generated/nutriBaseAPI.schemas'

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patient') ?? ''

  const [visit, setVisit] = useState<VisitResource | null>(null)
  const [patient, setPatient] = useState<PatientResource | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadVisit = useCallback(async () => {
    if (!patientId) { setError('Missing patient context.'); return }
    try {
      const res = await patientsVisitsShow(Number(patientId), Number(id))
      if (res.status !== 200) { setError((res.data as any)?.message ?? 'Failed to load visit.'); return }
      setVisit((res.data as any)?.data?.visit ?? null)
      setError(null)
    } catch {
      setError('Failed to load visit.')
    }
  }, [id, patientId])

  useEffect(() => {
    if (!patientId) return
    patientsShow(Number(patientId))
      .then(res => setPatient((res.data as any)?.data?.patient ?? null))
      .catch(() => null)
  }, [patientId])

  useEffect(() => {
    loadVisit()
    window.addEventListener('visits:changed', loadVisit)
    return () => window.removeEventListener('visits:changed', loadVisit)
  }, [loadVisit])

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 3 }}>
      {patient && <PatientDetailsCard patient={patient} />}
      {!visit ? <CircularProgress /> : <VisitDetail visit={visit} patientId={patientId} onUpdated={loadVisit} />}
    </Box>
  )
}
