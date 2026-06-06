'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { client, ApiError } from '@/api/client'
import type { PatientResource, VisitResource } from '@/api/generated/nutriBaseAPI.schemas'

type PatientListResponse = {
  message: string
  status: number
  data: PatientResource[]
  meta?: any
}

type VisitListResponse = {
  message: string
  status: number
  data: VisitResource[]
  meta?: any
}

type FlatVisit = {
  visit: VisitResource
  patient: PatientResource
}

export default function VisitsView() {
  const router = useRouter()
  const [flatVisits, setFlatVisits] = useState<FlatVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAllVisits = useCallback(async () => {
    try {
      setLoading(true)
      const patientsRes = await client.get<PatientListResponse>('api/patients')
      const patients = patientsRes.data ?? []

      const visitArrays = await Promise.all(
        patients.map(async patient => {
          try {
            const visitsRes = await client.get<VisitListResponse>(`api/patients/${patient.id}/visits`)
            return (visitsRes.data ?? []).map(visit => ({ visit, patient }))
          } catch {
            return []
          }
        })
      )

      const all = visitArrays
        .flat()
        .sort((a, b) => new Date(b.visit.attributes.date).getTime() - new Date(a.visit.attributes.date).getTime())

      setFlatVisits(all)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load visits.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllVisits()
  }, [loadAllVisits])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Visit History'
        subheader={`${flatVisits.length} visit${flatVisits.length !== 1 ? 's' : ''} total`}
      />
      <CardContent sx={{ p: 0 }}>
        {flatVisits.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color='text.secondary'>No visits recorded yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flatVisits.map(({ visit, patient }) => (
                  <TableRow key={`${patient.id}-${visit.id}`} hover>
                    <TableCell>{new Date(visit.attributes.date).toLocaleDateString()}</TableCell>
                    <TableCell>{patient.attributes.fullName}</TableCell>
                    <TableCell>{visit.attributes.doctorName ?? '—'}</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography noWrap variant='body2'>
                        {visit.attributes.notes ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='View'>
                        <IconButton
                          size='small'
                          onClick={() => router.push(`/visits/${visit.id}?patient=${patient.id}`)}
                        >
                          <i className='tabler-eye' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}
