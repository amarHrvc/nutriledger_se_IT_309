'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import CustomTextField from '@core/components/mui/TextField'
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

export default function EditPatientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const [formData, setFormData] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_type: '',
    allergies: '',
    medical_notes: ''
  })

  useEffect(() => {
    loadPatient()
  }, [id])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const res = await client.get<PatientResponse>(`api/patients/${id}`)
      const patient = res.data.patient
      
      setFormData({
        user_id: '', // user_id is not editable
        first_name: patient.attributes.firstName,
        last_name: patient.attributes.lastName,
        date_of_birth: patient.attributes.dateOfBirth,
        gender: patient.attributes.gender,
        phone: patient.attributes.phone || '',
        address: patient.attributes.address || '',
        city: patient.attributes.city || '',
        postal_code: patient.attributes.postalCode || '',
        emergency_contact_name: patient.attributes.emergencyContactName,
        emergency_contact_phone: patient.attributes.emergencyContactPhone,
        blood_type: patient.attributes.bloodType || '',
        allergies: patient.attributes.allergies || '',
        medical_notes: patient.attributes.medicalNotes || ''
      })
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors?.[field]) {
      setFieldErrors(prev => prev ? { ...prev, [field]: undefined } : null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors(null)
    setIsSubmitting(true)

    try {
      await client.put(`api/patients/${id}`, formData)
      router.push(`/patients/${id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.payload?.errors) {
          setError(err.payload.message ?? 'Please fix the highlighted errors.')
          setFieldErrors(err.payload.errors)
        } else {
          setError(err.payload?.message || err.message || 'Failed to update patient')
        }
      } else {
        setError('Failed to update patient')
      }
    } finally {
      setIsSubmitting(false)
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
        <Typography variant='h5' className='mb-6'>
          Edit Patient
        </Typography>

        {error && <Alert severity='error' className='mb-4'>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='First Name'
                value={formData.first_name}
                onChange={e => handleChange('first_name', e.target.value)}
                error={!!fieldErrors?.first_name}
                helperText={fieldErrors?.first_name?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Last Name'
                value={formData.last_name}
                onChange={e => handleChange('last_name', e.target.value)}
                error={!!fieldErrors?.last_name}
                helperText={fieldErrors?.last_name?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Date of Birth'
                type='date'
                value={formData.date_of_birth}
                onChange={e => handleChange('date_of_birth', e.target.value)}
                error={!!fieldErrors?.date_of_birth}
                helperText={fieldErrors?.date_of_birth?.[0]}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Gender'
                select
                value={formData.gender}
                onChange={e => handleChange('gender', e.target.value)}
                error={!!fieldErrors?.gender}
                helperText={fieldErrors?.gender?.[0]}
                required
                slotProps={{
                  select: {
                    native: true
                  }
                }}
              >
                <option value=''>Select Gender</option>
                <option value='M'>Male</option>
                <option value='F'>Female</option>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Phone'
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                error={!!fieldErrors?.phone}
                helperText={fieldErrors?.phone?.[0]}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Address'
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                error={!!fieldErrors?.address}
                helperText={fieldErrors?.address?.[0]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='City'
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                error={!!fieldErrors?.city}
                helperText={fieldErrors?.city?.[0]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Postal Code'
                value={formData.postal_code}
                onChange={e => handleChange('postal_code', e.target.value)}
                error={!!fieldErrors?.postal_code}
                helperText={fieldErrors?.postal_code?.[0]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Emergency Contact Name'
                value={formData.emergency_contact_name}
                onChange={e => handleChange('emergency_contact_name', e.target.value)}
                error={!!fieldErrors?.emergency_contact_name}
                helperText={fieldErrors?.emergency_contact_name?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Emergency Contact Phone'
                value={formData.emergency_contact_phone}
                onChange={e => handleChange('emergency_contact_phone', e.target.value)}
                error={!!fieldErrors?.emergency_contact_phone}
                helperText={fieldErrors?.emergency_contact_phone?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Blood Type'
                select
                value={formData.blood_type}
                onChange={e => handleChange('blood_type', e.target.value)}
                error={!!fieldErrors?.blood_type}
                helperText={fieldErrors?.blood_type?.[0]}
                slotProps={{
                  select: {
                    native: true
                  }
                }}
              >
                <option value=''>Select Blood Type</option>
                <option value='A+'>A+</option>
                <option value='A-'>A-</option>
                <option value='B+'>B+</option>
                <option value='B-'>B-</option>
                <option value='AB+'>AB+</option>
                <option value='AB-'>AB-</option>
                <option value='O+'>O+</option>
                <option value='O-'>O-</option>
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Allergies'
                multiline
                rows={3}
                value={formData.allergies}
                onChange={e => handleChange('allergies', e.target.value)}
                error={!!fieldErrors?.allergies}
                helperText={fieldErrors?.allergies?.[0]}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Medical Notes'
                multiline
                rows={3}
                value={formData.medical_notes}
                onChange={e => handleChange('medical_notes', e.target.value)}
                error={!!fieldErrors?.medical_notes}
                helperText={fieldErrors?.medical_notes?.[0]}
              />
            </Grid>
            <Grid item xs={12}>
              <div className='flex gap-4'>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={18} /> : <i className='tabler-check' />}
                >
                  {isSubmitting ? 'Updating...' : 'Update Patient'}
                </Button>
                <Button variant='outlined' onClick={() => router.push(`/patients/${id}`)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}
