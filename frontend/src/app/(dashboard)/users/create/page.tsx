'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'

import PageLoader from '@/components/PageLoader'
import CustomTextField from '@core/components/mui/TextField'
import { client, ApiError } from '@/api/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { notify } from '@/utils/notify'

export default function CreateUserPage() {
  const router = useRouter()
  const { isAdmin, ready } = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'doktor'
  })

  useEffect(() => {
    if (ready && !isAdmin) {
      router.replace('/home')
    }
  }, [ready, isAdmin, router])

  if (!ready || !isAdmin) {
    return <PageLoader />
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors?.[field]) {
      setFieldErrors(prev => (prev ? { ...prev, [field]: undefined } : null))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors(null)
    setIsSubmitting(true)

    try {
      await client.post('api/users', formData)
      notify.success('User created successfully.')
      router.push('/users')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.payload?.errors) {
          setError(err.payload.message ?? 'Please fix the highlighted errors.')
          setFieldErrors(err.payload.errors)
        } else {
          setError(err.payload?.message || err.message || 'Failed to create user')
        }
      } else {
        setError('Failed to create user')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title='Add User'
        action={
          <Button
            variant='outlined'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => router.push('/users')}
            disabled={isSubmitting}
          >
            Back
          </Button>
        }
      />
      <Divider />
      <CardContent sx={{ pt: 4 }}>
        {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Full Name'
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                error={!!fieldErrors?.name}
                helperText={fieldErrors?.name?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Email'
                type='email'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                error={!!fieldErrors?.email}
                helperText={fieldErrors?.email?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Role'
                select
                value={formData.role}
                onChange={e => handleChange('role', e.target.value)}
                error={!!fieldErrors?.role}
                helperText={fieldErrors?.role?.[0]}
                required
                slotProps={{ select: { native: true } }}
              >
                <option value='doktor'>Doctor</option>
                <option value='admin'>Admin</option>
                <option value='pacijent'>Patient</option>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6} />
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Password'
                type='password'
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                error={!!fieldErrors?.password}
                helperText={fieldErrors?.password?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Confirm Password'
                type='password'
                value={formData.password_confirmation}
                onChange={e => handleChange('password_confirmation', e.target.value)}
                error={!!fieldErrors?.password_confirmation}
                helperText={fieldErrors?.password_confirmation?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='tabler-check' />}
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
                <Button
                  variant='tonal'
                  color='secondary'
                  onClick={() => router.push('/users')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}
