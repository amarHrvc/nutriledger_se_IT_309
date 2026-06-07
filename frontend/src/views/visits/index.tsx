'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { patientsIndex } from '@/api/generated/patient/patient'
import { patientsVisitsIndex } from '@/api/generated/visit/visit'
import type { PatientResource, VisitResource } from '@/api/generated/nutriBaseAPI.schemas'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import VisitForm from './VisitForm'

type FlatVisit = {
  visit: VisitResource
  patient: PatientResource
}

export default function VisitsView() {
  const router = useRouter()
  const [flatVisits, setFlatVisits] = useState<FlatVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const { isPatient, isStaff } = useCurrentUser()

  const loadAllVisits = useCallback(async () => {
    try {
      setLoading(true)

      const patientsRes = await patientsIndex()
      if (patientsRes.status !== 200) throw new Error('Failed to load patients')
      const patients = ((patientsRes.data as any)?.data as PatientResource[]) ?? []

      const visitArrays = await Promise.all(
        patients.map(async patient => {
          try {
            const visitsRes = await patientsVisitsIndex(Number(patient.id))
            const visits = ((visitsRes.data as any)?.data as VisitResource[]) ?? []
            return visits.map(visit => ({ visit, patient }))
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
      setError(err instanceof Error ? err.message : 'Failed to load visits.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllVisits()
    window.addEventListener('visits:changed', loadAllVisits)
    return () => window.removeEventListener('visits:changed', loadAllVisits)
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
    <>
      <Card>
        <CardHeader
          title={isPatient ? 'My Visits' : 'Visit History'}
          subheader={`${flatVisits.length} visit${flatVisits.length !== 1 ? 's' : ''} total`}
          action={
            isStaff ? (
              <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setCreateOpen(true)}>
                New Visit
              </Button>
            ) : undefined
          }
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
                    {!isPatient && <TableCell>Patient</TableCell>}
                    <TableCell>Doctor</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flatVisits.map(({ visit, patient }) => (
                    <TableRow key={`${patient.id}-${visit.id}`} hover>
                      <TableCell>{new Date(visit.attributes.date).toLocaleDateString()}</TableCell>
                      {!isPatient && <TableCell>{patient.attributes.fullName}</TableCell>}
                      <TableCell>{visit.attributes.doctorName ?? '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography noWrap variant='body2'>{visit.attributes.notes ?? '—'}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Tooltip title='View'>
                          <IconButton size='small' onClick={() => router.push(`/visits/${visit.id}?patient=${patient.id}`)}>
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

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>New Visit</DialogTitle>
        <DialogContent>
          <VisitForm
            onSuccess={() => { setCreateOpen(false); loadAllVisits() }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
