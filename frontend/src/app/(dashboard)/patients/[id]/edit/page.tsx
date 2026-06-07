'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import { client, ApiError } from '@/api/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'

type PatientAttributes = {
  firstName: string; lastName: string; fullName: string; dateOfBirth: string; gender: string
  phone: string | null; address: string | null; city: string | null; postalCode: string | null
  emergencyContactName: string; emergencyContactPhone: string; bloodType: string | null
  allergies: string | null; medicalNotes: string | null; createdAt: string; updatedAt: string
}

type PatientResource = { type: 'patient'; id: string; attributes: PatientAttributes; relationships: any }
type PatientResponse = { message: string; status: number; data: { patient: PatientResource } }

const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    variant='overline'
    sx={{ display: 'block', mb: 3, color: 'text.secondary', letterSpacing: '1px', fontSize: '0.7rem' }}
  >
    {children}
  </Typography>
)

export default function EditPatientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { isPatient, ready } = useCurrentUser()

  useEffect(() => {
    if (ready && isPatient) {
      router.replace(`/patients/${id}`)
    }
  }, [ready, isPatient, router, id])

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: '',
    phone: '', address: '', city: '', postal_code: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    blood_type: '', allergies: '', medical_notes: ''
  })

  useEffect(() => { loadPatient() }, [id])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const res = await client.get<PatientResponse>(`api/patients/${id}`)
      const a = res.data.patient.attributes
      setFormData({
        first_name: a.firstName, last_name: a.lastName,
        date_of_birth: a.dateOfBirth, gender: a.gender,
        phone: a.phone || '', address: a.address || '',
        city: a.city || '', postal_code: a.postalCode || '',
        emergency_contact_name: a.emergencyContactName,
        emergency_contact_phone: a.emergencyContactPhone,
        blood_type: a.bloodType || '', allergies: a.allergies || '',
        medical_notes: a.medicalNotes || ''
      })
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load patient')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors?.[field]) setFieldErrors(prev => prev ? { ...prev, [field]: undefined } : null)
  }

  const fe = (field: string) => ({ error: !!fieldErrors?.[field], helperText: fieldErrors?.[field]?.[0] })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setFieldErrors(null); setIsSubmitting(true)
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

  if (!ready || isPatient || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Edit Patient'
        action={
          <Button variant='outlined' startIcon={<i className='tabler-arrow-left' />} onClick={() => router.push(`/patients/${id}`)}>
            Back
          </Button>
        }
      />
      <Divider />
      <CardContent sx={{ pt: 4 }}>
        {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>

          {/* Personal Information */}
          <Box sx={{ mb: 5 }}>
            <SectionTitle>Personal Information</SectionTitle>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='First Name' required value={formData.first_name}
                  onChange={e => handleChange('first_name', e.target.value)} {...fe('first_name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Last Name' required value={formData.last_name}
                  onChange={e => handleChange('last_name', e.target.value)} {...fe('last_name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Date of Birth' type='date' required
                  value={formData.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }} {...fe('date_of_birth')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Gender' select required value={formData.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                  slotProps={{ select: { native: true } }} {...fe('gender')}>
                  <option value=''>Select Gender</option>
                  <option value='M'>Male</option>
                  <option value='F'>Female</option>
                </CustomTextField>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 5 }} />

          {/* Contact Information */}
          <Box sx={{ mb: 5 }}>
            <SectionTitle>Contact Information</SectionTitle>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Phone' value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)} {...fe('phone')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='City' value={formData.city}
                  onChange={e => handleChange('city', e.target.value)} {...fe('city')} />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField fullWidth label='Address' value={formData.address}
                  onChange={e => handleChange('address', e.target.value)} {...fe('address')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Postal Code' value={formData.postal_code}
                  onChange={e => handleChange('postal_code', e.target.value)} {...fe('postal_code')} />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 5 }} />

          {/* Emergency Contact */}
          <Box sx={{ mb: 5 }}>
            <SectionTitle>Emergency Contact</SectionTitle>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Emergency Contact Name' required
                  value={formData.emergency_contact_name}
                  onChange={e => handleChange('emergency_contact_name', e.target.value)} {...fe('emergency_contact_name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Emergency Contact Phone' required
                  value={formData.emergency_contact_phone}
                  onChange={e => handleChange('emergency_contact_phone', e.target.value)} {...fe('emergency_contact_phone')} />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 5 }} />

          {/* Medical Information */}
          <Box sx={{ mb: 5 }}>
            <SectionTitle>Medical Information</SectionTitle>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth label='Blood Type' select value={formData.blood_type}
                  onChange={e => handleChange('blood_type', e.target.value)}
                  slotProps={{ select: { native: true } }} {...fe('blood_type')}>
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
                <CustomTextField fullWidth label='Allergies' multiline rows={3} value={formData.allergies}
                  onChange={e => handleChange('allergies', e.target.value)} {...fe('allergies')} />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField fullWidth label='Medical Notes' multiline rows={3} value={formData.medical_notes}
                  onChange={e => handleChange('medical_notes', e.target.value)} {...fe('medical_notes')} />
              </Grid>
            </Grid>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button type='submit' variant='contained' disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='tabler-check' />}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={() => router.push(`/patients/${id}`)} disabled={isSubmitting}>
              Cancel
            </Button>
          </Box>

        </form>
      </CardContent>
    </Card>
  )
}
