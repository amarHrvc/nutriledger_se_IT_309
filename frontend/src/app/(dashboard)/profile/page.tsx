'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import PageBackButton from '@/components/PageBackButton'
import PageLoader from '@/components/PageLoader'
import { client, ApiError } from '@/api/client'
import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { notify } from '@/utils/notify'
import { roleColor, roleLabel } from '@/utils/userRole'

type UserResponse = {
  message: string
  status: number
  data: { user: UserResource }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, ready } = useCurrentUser()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [profile, setProfile] = useState<UserResource | null>(null)

  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })

  useEffect(() => {
    if (ready) {
      loadProfile()
    }
  }, [ready])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const res = await client.get<UserResponse>('api/user')
      setProfile(res.data.user)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors?.[field]) {
      setFieldErrors(prev => (prev ? { ...prev, [field]: undefined } : null))
    }
  }

  const fe = (field: string) => ({
    error: !!fieldErrors?.[field],
    helperText: fieldErrors?.[field]?.[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors(null)
    setIsSubmitting(true)

    try {
      await client.put('api/user/password', formData)
      notify.success('Password updated successfully.')
      setFormData({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.payload?.errors) {
          setError(err.payload.message ?? 'Please fix the highlighted errors.')
          setFieldErrors(err.payload.errors)
        } else {
          setError(err.payload?.message || err.message || 'Failed to update password')
        }
      } else {
        setError('Failed to update password')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ready || loading) {
    return <PageLoader />
  }

  const displayUser = profile ?? user
  const attributes = displayUser?.attributes

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardHeader
            title='My Profile'
            avatar={
              <CustomAvatar skin='light' color='primary' size={38}>
                <i className='tabler-user' />
              </CustomAvatar>
            }
            action={<PageBackButton onClick={() => router.push('/home')} label='Back to Home' />}
          />
          <Divider />
          <CardContent>
            {error && !fieldErrors && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
            <div className='flex flex-col gap-4'>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  Name
                </Typography>
                <Typography variant='body1'>{attributes?.name ?? '—'}</Typography>
              </div>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  Email
                </Typography>
                <Typography variant='body1'>{attributes?.email ?? '—'}</Typography>
              </div>
              <div>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Role
                </Typography>
                {attributes?.role ? (
                  <Chip
                    label={roleLabel(attributes.role)}
                    size='small'
                    color={roleColor(attributes.role)}
                  />
                ) : (
                  <Typography variant='body1'>—</Typography>
                )}
              </div>
              <Typography variant='caption' color='text.secondary'>
                Contact an administrator to update your name or email.
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardHeader title='Change Password' />
          <Divider />
          <CardContent sx={{ pt: 4 }}>
            {error && fieldErrors && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                  <CustomTextField
                    fullWidth
                    label='Current password'
                    type='password'
                    required
                    value={formData.current_password}
                    onChange={e => handleChange('current_password', e.target.value)}
                    {...fe('current_password')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='New password'
                    type='password'
                    required
                    value={formData.password}
                    onChange={e => handleChange('password', e.target.value)}
                    {...fe('password')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='Confirm new password'
                    type='password'
                    required
                    value={formData.password_confirmation}
                    onChange={e => handleChange('password_confirmation', e.target.value)}
                    {...fe('password_confirmation')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Button
                      type='submit'
                      variant='contained'
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? <CircularProgress size={16} /> : <i className='tabler-lock' />
                      }
                    >
                      {isSubmitting ? 'Updating...' : 'Update Password'}
                    </Button>
                    <PageBackButton onClick={() => router.push('/home')} label='Back to Home' />
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
