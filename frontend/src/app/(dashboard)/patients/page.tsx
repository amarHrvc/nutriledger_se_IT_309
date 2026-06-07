'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

import ListPagination from '@/components/ListPagination'
import PageLoader from '@/components/PageLoader'
import { client, ApiError } from '@/api/client'
import { useConfirm } from '@/hooks/useConfirm'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { notify } from '@/utils/notify'
import { buildPageQuery, type PaginationMeta, type PaginatedResponse } from '@/types/pagination'

type PatientAttributes = {
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: string
  gender: string
  phone: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  emergencyContactName: string
  emergencyContactPhone: string
  bloodType: string | null
  allergies: string | null
  medicalNotes: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

type PatientResource = {
  type: 'patient'
  id: string
  attributes: PatientAttributes
  relationships: any
}

type PatientListResponse = PaginatedResponse<PatientResource>

function MyRecordCard({ patient, onView }: { patient: PatientResource; onView: () => void }) {
  const { attributes } = patient

  return (
    <Card>
      <CardContent className='p-6'>
        <Typography variant='h5' className='mb-4'>
          My Record
        </Typography>
        <Divider className='mb-4' />
        <div className='flex flex-col gap-3 mb-6'>
          <div>
            <Typography variant='body2' color='text.secondary'>
              Name
            </Typography>
            <Typography variant='body1'>{attributes.fullName}</Typography>
          </div>
          <div>
            <Typography variant='body2' color='text.secondary'>
              Date of birth
            </Typography>
            <Typography variant='body1'>
              {new Date(attributes.dateOfBirth).toLocaleDateString()}
            </Typography>
          </div>
          <div>
            <Typography variant='body2' color='text.secondary'>
              Phone
            </Typography>
            <Typography variant='body1'>{attributes.phone || '—'}</Typography>
          </div>
          <div>
            <Typography variant='body2' color='text.secondary'>
              Blood type
            </Typography>
            <Typography variant='body1'>{attributes.bloodType || '—'}</Typography>
          </div>
          <div>
            <Typography variant='body2' color='text.secondary'>
              Allergies
            </Typography>
            <Typography variant='body1'>{attributes.allergies || '—'}</Typography>
          </div>
        </div>
        <Button variant='contained' startIcon={<i className='tabler-eye' />} onClick={onView}>
          View full record
        </Button>
      </CardContent>
    </Card>
  )
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { isPatient, isStaff, isAdmin, ready } = useCurrentUser()
  const { confirm, ConfirmDialog } = useConfirm()

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim()
      setSearch(prev => {
        if (prev !== trimmed) {
          setPage(1)
        }
        return trimmed
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (ready) {
      loadPatients(page, search)
    }
  }, [ready, page, search])

  const loadPatients = async (pageNum: number, searchTerm = '') => {
    try {
      setLoading(true)
      const res = await client.get<PatientListResponse>(
        `api/patients?${buildPageQuery(pageNum, undefined, searchTerm)}`
      )
      setPatients(res.data)
      setMeta(res.meta ?? null)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load patients')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete patient',
      message: 'Are you sure you want to delete this patient?',
      confirmLabel: 'Delete',
      confirmColor: 'error'
    })
    if (!confirmed) return

    try {
      await client.delete(`api/patients/${id}`)
      notify.success('Patient deleted.')
      if (patients.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        await loadPatients(page, search)
      }
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to delete patient')
    }
  }

  const handleRestore = async (id: string) => {
    const confirmed = await confirm({
      title: 'Restore patient',
      message: 'This patient will appear in the active list again.',
      confirmLabel: 'Restore',
      confirmColor: 'success'
    })
    if (!confirmed) return

    try {
      await client.post(`api/patients/${id}/restore`, {})
      notify.success('Patient restored.')
      await loadPatients(page, search)
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to restore patient')
    }
  }

  if (!ready || loading) {
    return <PageLoader />
  }

  if (isPatient) {
    if (error) {
      return <Alert severity='error'>{error}</Alert>
    }

    if (patients.length === 0) {
      return (
        <Alert severity='info'>No medical record is linked to your account yet.</Alert>
      )
    }

    return (
      <MyRecordCard
        patient={patients[0]}
        onView={() => router.push(`/patients/${patients[0].id}`)}
      />
    )
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className='flex justify-between items-center mb-6'>
            <Typography variant='h5'>Patients</Typography>
            {isStaff && (
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => router.push('/patients/create')}
              >
                Add Patient
              </Button>
            )}
          </div>

          <TextField
            fullWidth
            size='small'
            placeholder='Search by name…'
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className='mb-4'
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-search' />
                  </InputAdornment>
                )
              }
            }}
          />

          {error && <Alert severity='error' className='mb-4'>{error}</Alert>}

          {patients.length === 0 ? (
            <Alert severity='info'>
              {search ? 'No patients match your search.' : 'No patients found. Create your first patient to get started.'}
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date of Birth</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Blood Type</TableCell>
                    {isAdmin && <TableCell>Status</TableCell>}
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map(patient => {
                    const isDeleted = !!patient.attributes.deletedAt

                    return (
                      <TableRow
                        key={patient.id}
                        hover
                        sx={isDeleted ? { opacity: 0.65 } : undefined}
                      >
                        <TableCell>
                          {patient.attributes.firstName} {patient.attributes.lastName}
                        </TableCell>
                        <TableCell>{new Date(patient.attributes.dateOfBirth).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip label={patient.attributes.gender === 'M' ? 'Male' : 'Female'} size='small' />
                        </TableCell>
                        <TableCell>{patient.attributes.phone || '-'}</TableCell>
                        <TableCell>{patient.attributes.bloodType || '-'}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Chip
                              label={isDeleted ? 'Deleted' : 'Active'}
                              size='small'
                              color={isDeleted ? 'default' : 'success'}
                            />
                          </TableCell>
                        )}
                        <TableCell align='right'>
                          <Tooltip title='View'>
                            <IconButton
                              size='small'
                              onClick={() => router.push(`/patients/${patient.id}`)}
                            >
                              <i className='tabler-eye' />
                            </IconButton>
                          </Tooltip>
                          {!isDeleted && (
                            <Tooltip title='Edit'>
                              <IconButton
                                size='small'
                                onClick={() => router.push(`/patients/${patient.id}/edit`)}
                              >
                                <i className='tabler-edit' />
                              </IconButton>
                            </Tooltip>
                          )}
                          {!isDeleted && (
                            <Tooltip title='Delete'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleDelete(patient.id)}
                              >
                                <i className='tabler-trash' />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isDeleted && isAdmin && (
                            <Tooltip title='Restore'>
                              <IconButton
                                size='small'
                                color='success'
                                onClick={() => handleRestore(patient.id)}
                              >
                                <i className='tabler-refresh' />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {meta && (
            <ListPagination
              meta={meta}
              onPageChange={setPage}
              disabled={loading}
            />
          )}
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  )
}
