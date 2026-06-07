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

import PageBackButton from '@/components/PageBackButton'
import PageLoader from '@/components/PageLoader'
import CustomTextField from '@core/components/mui/TextField'
import { client, ApiError } from '@/api/client'
import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { notify } from '@/utils/notify'

type UserResponse = {
  message: string
  status: number
  data: { user: UserResource }
}

const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    variant='overline'
    sx={{ display: 'block', mb: 3, color: 'text.secondary', letterSpacing: '1px', fontSize: '0.7rem' }}
  >
    {children}
  </Typography>
)

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { isAdmin, ready } = useCurrentUser()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'doktor',
    password: ''
  })

  useEffect(() => {
    if (ready && !isAdmin) {
      router.replace('/home')
    }
  }, [ready, isAdmin, router])

  useEffect(() => {
    if (ready && isAdmin) {
      loadUser()
    }
  }, [ready, isAdmin, id])

  const loadUser = async () => {
    try {
      setLoading(true)
      const res = await client.get<UserResponse>(`api/users/${id}`)
      const user = res.data.user

      if (user.attributes.deletedAt) {
        router.replace(`/users/${id}`)
        return
      }

      setFormData({
        name: user.attributes.name,
        email: user.attributes.email,
        role: user.attributes.role,
        password: ''
      })
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load user')
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

    const payload: Record<string, string> = {
      name: formData.name,
      email: formData.email,
      role: formData.role
    }

    if (formData.password.trim()) {
      payload.password = formData.password
    }

    try {
      await client.put(`api/users/${id}`, payload)
      notify.success('User updated successfully.')
      router.push(`/users/${id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.payload?.errors) {
          setError(err.payload.message ?? 'Please fix the highlighted errors.')
          setFieldErrors(err.payload.errors)
        } else {
          setError(err.payload?.message || err.message || 'Failed to update user')
        }
      } else {
        setError('Failed to update user')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ready || !isAdmin || loading) {
    return <PageLoader />
  }

  return (
    <Card>
      <CardHeader
        title='Edit User'
        action={<PageBackButton onClick={() => router.push(`/users/${id}`)} />}
      />
      <Divider />
      <CardContent sx={{ pt: 4 }}>
        {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 5 }}>
            <SectionTitle>Account Details</SectionTitle>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Full Name'
                  required
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  {...fe('name')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  {...fe('email')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Role'
                  select
                  required
                  value={formData.role}
                  onChange={e => handleChange('role', e.target.value)}
                  slotProps={{ select: { native: true } }}
                  {...fe('role')}
                >
                  <option value='doktor'>Doctor</option>
                  <option value='admin'>Admin</option>
                  <option value='pacijent'>Patient</option>
                </CustomTextField>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 5 }} />

          <Box sx={{ mb: 5 }}>
            <SectionTitle>Change Password (optional)</SectionTitle>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='New Password'
                  type='password'
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  helperText={fieldErrors?.password?.[0] || 'Leave blank to keep current password'}
                  error={!!fieldErrors?.password}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button
              type='submit'
              variant='contained'
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='tabler-check' />}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant='tonal'
              color='secondary'
              onClick={() => router.push(`/users/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}
