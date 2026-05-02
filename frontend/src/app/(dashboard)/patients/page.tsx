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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import { client, ApiError } from '@/api/client'

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
}

type PatientResource = {
  type: 'patient'
  id: string
  attributes: PatientAttributes
  relationships: any
}

type PatientListResponse = {
  message: string
  status: number
  data: PatientResource[]
  meta?: any
  links?: any
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const res = await client.get<PatientListResponse>('api/patients')
      setPatients(res.data)
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
    if (!confirm('Are you sure you want to delete this patient?')) return

    try {
      await client.delete(`api/patients/${id}`)
      setPatients(patients.filter(p => p.id !== id))
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message)
      } else {
        alert('Failed to delete patient')
      }
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center mb-6'>
          <Typography variant='h5'>Patients</Typography>
          <Button
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={() => router.push('/patients/create')}
          >
            Add Patient
          </Button>
        </div>

        {error && <Alert severity='error' className='mb-4'>{error}</Alert>}

        {patients.length === 0 ? (
          <Alert severity='info'>No patients found. Create your first patient to get started.</Alert>
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
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map(patient => (
                  <TableRow key={patient.id} hover>
                    <TableCell>
                      {patient.attributes.firstName} {patient.attributes.lastName}
                    </TableCell>
                    <TableCell>{new Date(patient.attributes.dateOfBirth).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={patient.attributes.gender === 'M' ? 'Male' : 'Female'} size='small' />
                    </TableCell>
                    <TableCell>{patient.attributes.phone || '-'}</TableCell>
                    <TableCell>{patient.attributes.bloodType || '-'}</TableCell>
                    <TableCell align='right'>
                      <IconButton
                        size='small'
                        onClick={() => router.push(`/patients/${patient.id}`)}
                        title='View'
                      >
                        <i className='tabler-eye' />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() => router.push(`/patients/${patient.id}/edit`)}
                        title='Edit'
                      >
                        <i className='tabler-edit' />
                      </IconButton>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDelete(patient.id)}
                        title='Delete'
                      >
                        <i className='tabler-trash' />
                      </IconButton>
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
