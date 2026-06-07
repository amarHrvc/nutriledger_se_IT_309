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
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import PageLoader from '@/components/PageLoader'
import { client, ApiError } from '@/api/client'
import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'
import { useConfirm } from '@/hooks/useConfirm'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { notify } from '@/utils/notify'
import { roleColor, roleLabel } from '@/utils/userRole'

type UserListResponse = {
  message: string
  status: number
  data: UserResource[]
}

export default function UsersPage() {
  const router = useRouter()
  const { isAdmin, ready, user: currentUser } = useCurrentUser()
  const { confirm, ConfirmDialog } = useConfirm()
  const [users, setUsers] = useState<UserResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ready && !isAdmin) {
      router.replace('/home')
    }
  }, [ready, isAdmin, router])

  useEffect(() => {
    if (ready && isAdmin) {
      loadUsers()
    }
  }, [ready, isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await client.get<UserListResponse>('api/users')
      setUsers(res.data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (id: number) => {
    const confirmed = await confirm({
      title: 'Deactivate user',
      message: 'This user will no longer be able to sign in.',
      confirmLabel: 'Deactivate',
      confirmColor: 'warning'
    })
    if (!confirmed) return

    try {
      await client.delete(`api/users/${id}`)
      notify.success('User deactivated.')
      await loadUsers()
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to deactivate user')
    }
  }

  const handleRestore = async (id: number) => {
    const confirmed = await confirm({
      title: 'Restore user',
      message: 'This user will be able to sign in again.',
      confirmLabel: 'Restore',
      confirmColor: 'success'
    })
    if (!confirmed) return

    try {
      await client.post(`api/users/${id}/restore`, {})
      notify.success('User restored.')
      await loadUsers()
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to restore user')
    }
  }

  const handleForceDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete permanently',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmColor: 'error'
    })
    if (!confirmed) return

    try {
      await client.delete(`api/users/${id}/force`)
      notify.success('User permanently deleted.')
      await loadUsers()
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : 'Failed to delete user')
    }
  }

  if (!ready || !isAdmin || loading) {
    return <PageLoader />
  }

  const activeCount = users.filter(u => !u.attributes.deletedAt).length

  return (
    <>
      <Card>
        <CardHeader
          title='Users'
          subheader={`${activeCount} active · ${users.length} total`}
          action={
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => router.push('/users/create')}
            >
              Add User
            </Button>
          }
        />
        <CardContent sx={{ p: 0 }}>
          {error && (
            <Box sx={{ px: 4, pt: 2 }}>
              <Alert severity='error'>{error}</Alert>
            </Box>
          )}

          {users.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color='text.secondary'>No users found.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => {
                    const isDeleted = !!user.attributes.deletedAt
                    const isSelf = currentUser?.id === user.id

                    return (
                      <TableRow
                        key={user.id}
                        hover
                        sx={isDeleted ? { opacity: 0.65 } : undefined}
                      >
                        <TableCell>{user.attributes.name}</TableCell>
                        <TableCell>{user.attributes.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={roleLabel(user.attributes.role)}
                            size='small'
                            color={roleColor(user.attributes.role)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isDeleted ? 'Deactivated' : 'Active'}
                            size='small'
                            color={isDeleted ? 'default' : 'success'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.attributes.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align='right'>
                          <Tooltip title='View'>
                            <IconButton
                              size='small'
                              onClick={() => router.push(`/users/${user.id}`)}
                            >
                              <i className='tabler-eye' />
                            </IconButton>
                          </Tooltip>
                          {!isDeleted && (
                            <Tooltip title='Edit'>
                              <IconButton
                                size='small'
                                onClick={() => router.push(`/users/${user.id}/edit`)}
                              >
                                <i className='tabler-edit' />
                              </IconButton>
                            </Tooltip>
                          )}
                          {!isDeleted && !isSelf && (
                            <Tooltip title='Deactivate'>
                              <IconButton
                                size='small'
                                color='warning'
                                onClick={() => handleDeactivate(user.id)}
                              >
                                <i className='tabler-user-off' />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isDeleted && (
                            <Tooltip title='Restore'>
                              <IconButton
                                size='small'
                                color='success'
                                onClick={() => handleRestore(user.id)}
                              >
                                <i className='tabler-refresh' />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isDeleted && (
                            <Tooltip title='Delete permanently'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleForceDelete(user.id)}
                              >
                                <i className='tabler-trash' />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  )
}
