'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import { client, ApiError } from '@/api/client'
import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'

export default function HomePage() {
  const [user, setUser] = useState<UserResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get from localStorage first
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Fetch fresh data from API
        const res = await client.get<{ data: { user: UserResource } }>('api/user')
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to load user profile')
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>
  }

  if (!user) {
    return <Alert severity='warning'>No user data available</Alert>
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4'>Welcome back, {user.attributes.name}!</Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-4 mb-4'>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                {user.attributes.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Typography variant='h5'>{user.attributes.name}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {user.attributes.email}
                </Typography>
                <Chip label={user.attributes.role} size='small' color='primary' className='mt-2' />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Typography variant='body2' color='text.secondary'>
                  Member since:
                </Typography>
                <Typography variant='body2'>
                  {new Date(user.attributes.createdAt).toLocaleDateString()}
                </Typography>
              </div>
              <div className='flex justify-between'>
                <Typography variant='body2' color='text.secondary'>
                  Last updated:
                </Typography>
                <Typography variant='body2'>
                  {new Date(user.attributes.updatedAt).toLocaleDateString()}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {user.relationships.patient && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' className='mb-4'>
                Patient Information
              </Typography>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Name:
                  </Typography>
                  <Typography variant='body2'>
                    {user.relationships.patient.first_name} {user.relationships.patient.last_name}
                  </Typography>
                </div>
                <div className='flex justify-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Date of Birth:
                  </Typography>
                  <Typography variant='body2'>
                    {new Date(user.relationships.patient.date_of_birth).toLocaleDateString()}
                  </Typography>
                </div>
                {user.relationships.patient.phone && (
                  <div className='flex justify-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Phone:
                    </Typography>
                    <Typography variant='body2'>{user.relationships.patient.phone}</Typography>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}
