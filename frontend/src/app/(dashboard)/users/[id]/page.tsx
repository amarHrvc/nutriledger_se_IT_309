'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import PageLoader from '@/components/PageLoader'
import { client, ApiError } from '@/api/client'
import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'
import { useConfirm } from '@/hooks/useConfirm'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { notify } from '@/utils/notify'
import { roleColor, roleLabel } from '@/utils/userRole'

type UserResponse = {
  message: string
  status: number
  data: { user: UserResource }
}

export default function ViewUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { isAdmin, ready, user: currentUser } = useCurrentUser()
  const { confirm, ConfirmDialog } = useConfirm()

  const [user, setUser] = useState<UserResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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
      setUser(res.data.user)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    const confirmed = await confirm({
      title: 'Deactivate user',
      message: 'This user will no longer be able to sign in.',
      confirmLabel: 'Deactivate',
      confirmColor: 'warning'
    })
    if (!confirmed) return

    try {
      setActionLoading(true)
      await client.delete(`api/users/${id}`)
      notify.success('User deactivated.')
      await loadUser()
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to deactivate user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRestore = async () => {
    const confirmed = await confirm({
      title: 'Restore user',
      message: 'This user will be able to sign in again.',
      confirmLabel: 'Restore',
      confirmColor: 'success'
    })
    if (!confirmed) return

    try {
      setActionLoading(true)
      await client.post(`api/users/${id}/restore`, {})
      notify.success('User restored.')
      await loadUser()
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to restore user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleForceDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete permanently',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmColor: 'error'
    })
    if (!confirmed) return

    try {
      setActionLoading(true)
      await client.delete(`api/users/${id}/force`)
      notify.success('User permanently deleted.')
      router.push('/users')
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to delete user')
      setActionLoading(false)
    }
  }

  if (!ready || !isAdmin || loading) {
    return <PageLoader />
  }

  if (error || !user) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error || 'User not found'}</Alert>
          <Button variant='outlined' onClick={() => router.push('/users')} sx={{ mt: 4 }}>
            Back to Users
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isDeleted = !!user.attributes.deletedAt
  const isSelf = currentUser?.id === user.id
  const { attributes } = user

  return (
    <>
      <Card>
        <CardHeader
          title='User Details'
          action={
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {!isDeleted && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<i className='tabler-edit' />}
                  onClick={() => router.push(`/users/${id}/edit`)}
                  disabled={actionLoading}
                >
                  Edit
                </Button>
              )}
              {!isDeleted && !isSelf && (
                <Button
                  size='small'
                  variant='outlined'
                  color='warning'
                  startIcon={<i className='tabler-user-off' />}
                  onClick={handleDeactivate}
                  disabled={actionLoading}
                >
                  Deactivate
                </Button>
              )}
              {isDeleted && (
                <Button
                  size='small'
                  variant='outlined'
                  color='success'
                  startIcon={<i className='tabler-refresh' />}
                  onClick={handleRestore}
                  disabled={actionLoading}
                >
                  Restore
                </Button>
              )}
              {isDeleted && (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<i className='tabler-trash' />}
                  onClick={handleForceDelete}
                  disabled={actionLoading}
                >
                  Delete
                </Button>
              )}
              <Button
                size='small'
                variant='tonal'
                color='secondary'
                onClick={() => router.push('/users')}
                disabled={actionLoading}
              >
                Back
              </Button>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' mb={0.5}>Name</Typography>
                <Typography variant='body1'>{attributes.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' mb={0.5}>Email</Typography>
                <Typography variant='body1'>{attributes.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' mb={0.5}>Role</Typography>
                <Chip
                  label={roleLabel(attributes.role)}
                  size='small'
                  color={roleColor(attributes.role)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary' mb={0.5}>Status</Typography>
                <Chip
                  label={isDeleted ? 'Deactivated' : 'Active'}
                  size='small'
                  color={isDeleted ? 'default' : 'success'}
                />
              </Grid>
            </Grid>

            <Divider />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant='caption' color='text.secondary'>
                Created: {new Date(attributes.createdAt).toLocaleString()}
              </Typography>
              <Typography variant='caption' color='text.secondary'>•</Typography>
              <Typography variant='caption' color='text.secondary'>
                Updated: {attributes.updatedAt ? new Date(attributes.updatedAt).toLocaleString() : '—'}
              </Typography>
              {isDeleted && (
                <>
                  <Typography variant='caption' color='text.secondary'>•</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Deactivated: {new Date(attributes.deletedAt!).toLocaleString()}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  )
}
