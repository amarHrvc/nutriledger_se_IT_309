'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
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

type PatientResponse = {
  message: string
  status: number
  data: { patient: PatientResource }
}

export default function ViewPatientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [patient, setPatient] = useState<PatientResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPatient()
  }, [id])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const res = await client.get<PatientResponse>(`api/patients/${id}`)
      setPatient(res.data.patient)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load patient')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <CircularProgress />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error || 'Patient not found'}</Alert>
          <Button variant='outlined' onClick={() => router.push('/patients')} className='mt-4'>
            Back to Patients
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center mb-6'>
          <Typography variant='h5'>Patient Details</Typography>
          <div className='flex gap-2'>
            <Button
              variant='contained'
              startIcon={<i className='tabler-edit' />}
              onClick={() => router.push(`/patients/${id}/edit`)}
            >
              Edit
            </Button>
            <Button variant='outlined' onClick={() => router.push('/patients')}>
              Back
            </Button>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <Typography variant='h6' className='mb-4'>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  First Name
                </Typography>
                <Typography variant='body1'>{patient.attributes.firstName}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Last Name
                </Typography>
                <Typography variant='body1'>{patient.attributes.lastName}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Date of Birth
                </Typography>
                <Typography variant='body1'>
                  {new Date(patient.attributes.dateOfBirth).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Gender
                </Typography>
                <Chip label={patient.attributes.gender === 'M' ? 'Male' : 'Female'} size='small' />
              </Grid>
            </Grid>
          </div>

          <Divider />

          <div>
            <Typography variant='h6' className='mb-4'>
              Contact Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Phone
                </Typography>
                <Typography variant='body1'>{patient.attributes.phone || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Address
                </Typography>
                <Typography variant='body1'>{patient.attributes.address || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  City
                </Typography>
                <Typography variant='body1'>{patient.attributes.city || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Postal Code
                </Typography>
                <Typography variant='body1'>{patient.attributes.postalCode || '-'}</Typography>
              </Grid>
            </Grid>
          </div>

          <Divider />

          <div>
            <Typography variant='h6' className='mb-4'>
              Emergency Contact
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Emergency Contact Name
                </Typography>
                <Typography variant='body1'>{patient.attributes.emergencyContactName}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Emergency Contact Phone
                </Typography>
                <Typography variant='body1'>{patient.attributes.emergencyContactPhone}</Typography>
              </Grid>
            </Grid>
          </div>

          <Divider />

          <div>
            <Typography variant='h6' className='mb-4'>
              Medical Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Blood Type
                </Typography>
                <Typography variant='body1'>{patient.attributes.bloodType || '-'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Allergies
                </Typography>
                <Typography variant='body1'>{patient.attributes.allergies || '-'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Medical Notes
                </Typography>
                <Typography variant='body1'>{patient.attributes.medicalNotes || '-'}</Typography>
              </Grid>
            </Grid>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
