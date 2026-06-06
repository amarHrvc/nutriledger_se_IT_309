'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { client, ApiError } from '@/api/client'
import VisitDetail from '@views/visits/VisitDetail'
import PatientDetailsCard from '@views/patients/patient-left/PatientDetailsCard'
import type { PatientResource, VisitResource } from '@/api/generated/nutriBaseAPI.schemas'

type PatientShowResponse = { message: string; status: number; data: { patient: PatientResource } }
type VisitShowResponse = { message: string; status: number; data: { visit: VisitResource } }

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patient') ?? ''

  const [visit, setVisit] = useState<VisitResource | null>(null)
  const [patient, setPatient] = useState<PatientResource | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadVisit = useCallback(async () => {
    if (!patientId) {
      setError('Missing patient context.')
      return
    }
    try {
      const res = await client.get<VisitShowResponse>(`api/patients/${patientId}/visits/${id}`)
      setVisit(res.data.visit)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load visit.')
    }
  }, [id, patientId])

  useEffect(() => {
    if (!patientId) return
    client
      .get<PatientShowResponse>(`api/patients/${patientId}`)
      .then(res => setPatient(res.data.patient))
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
      {!visit ? <CircularProgress /> : <VisitDetail visit={visit} onUpdated={loadVisit} />}
    </Box>
  )
}
