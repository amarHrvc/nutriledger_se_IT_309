'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import PageLoader from '@/components/PageLoader'
import CustomTextField from '@core/components/mui/TextField'
import { client, ApiError } from '@/api/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { notify } from '@/utils/notify'
import { fetchUnlinkedPatientUsers, type PatientUserOption } from '@/utils/unlinkedPatientUsers'

export default function CreatePatientPage() {
  const router = useRouter()
  const { isPatient, ready } = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [eligibleUsers, setEligibleUsers] = useState<PatientUserOption[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

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
    if (ready && isPatient) {
      router.replace('/patients')
    }
  }, [ready, isPatient, router])

  useEffect(() => {
    if (!ready || isPatient) return

    const loadUsers = async () => {
      try {
        setUsersLoading(true)
        setEligibleUsers(await fetchUnlinkedPatientUsers())
        setUsersError(null)
      } catch (err) {
        setUsersError(err instanceof ApiError ? err.message : 'Failed to load patient accounts')
      } finally {
        setUsersLoading(false)
      }
    }

    loadUsers()
  }, [ready, isPatient])

  if (!ready || isPatient) {
    return <PageLoader />
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
      await client.post('api/patients', {
        ...formData,
        user_id: Number(formData.user_id)
      })
      notify.success('Patient created successfully.')
      router.push('/patients')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.payload?.errors) {
          setError(err.payload.message ?? 'Please fix the highlighted errors.')
          setFieldErrors(err.payload.errors)
        } else {
          setError(err.payload?.message || err.message || 'Failed to create patient')
        }
      } else {
        setError('Failed to create patient')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' className='mb-6'>
          Create New Patient
        </Typography>

        {error && <Alert severity='error' className='mb-4'>{error}</Alert>}
        {usersError && <Alert severity='error' className='mb-4'>{usersError}</Alert>}
        {!usersLoading && eligibleUsers.length === 0 && !usersError && (
          <Alert severity='info' className='mb-4'>
            No patient accounts without a medical record. Add a user with the Patient role first.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Patient account'
                select
                value={formData.user_id}
                onChange={e => handleChange('user_id', e.target.value)}
                error={!!fieldErrors?.user_id}
                helperText={fieldErrors?.user_id?.[0] || 'Link this record to an existing patient login'}
                required
                disabled={usersLoading || eligibleUsers.length === 0}
                slotProps={{
                  select: {
                    native: true
                  }
                }}
              >
                <option value=''>{usersLoading ? 'Loading accounts...' : 'Select patient account'}</option>
                {eligibleUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </CustomTextField>
            </Grid>
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
                  disabled={isSubmitting || usersLoading || eligibleUsers.length === 0}
                  startIcon={isSubmitting ? <CircularProgress size={18} /> : <i className='tabler-check' />}
                >
                  {isSubmitting ? 'Creating...' : 'Create Patient'}
                </Button>
                <Button variant='outlined' onClick={() => router.push('/patients')} disabled={isSubmitting}>
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
