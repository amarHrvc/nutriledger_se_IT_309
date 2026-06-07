'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import { patientsVisitsDestroy } from '@/api/generated/visit/visit'
import type { VisitResource } from '@/api/generated/nutriBaseAPI.schemas'
import VisitEditForm from './VisitEditForm'

type Props = {
  visit: VisitResource
  patientId: string
  onUpdated: () => void
}

export default function VisitDetail({ visit, patientId, onUpdated }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { attributes } = visit

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setIsAdmin(JSON.parse(storedUser).attributes?.role === 'admin')
    }
  }, [])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this visit?')) return

    try {
      setDeleting(true)
      setDeleteError(null)
      const res = await patientsVisitsDestroy(Number(patientId), Number(visit.id))
      if (res.status !== 204) {
        throw new Error((res.data as { message?: string })?.message ?? 'Failed to delete visit.')
      }
      window.dispatchEvent(new Event('visits:changed'))
      router.push('/visits')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete visit.')
    } finally {
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <Card>
        <CardHeader title='Edit Visit' />
        <CardContent>
          <VisitEditForm
            visit={visit}
            patientId={patientId}
            onSuccess={() => { setEditing(false); onUpdated() }}
            onCancel={() => setEditing(false)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Visit Details'
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size='small' variant='outlined' startIcon={<i className='tabler-edit' />} onClick={() => setEditing(true)}>
              Edit
            </Button>
            {isAdmin && (
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<i className='tabler-trash' />}
                disabled={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {deleteError && (
            <Typography variant='body2' color='error'>
              {deleteError}
            </Typography>
          )}
          <Box>
            <Typography variant='body2' color='text.secondary' mb={0.5}>Date</Typography>
            <Typography variant='body1'>{new Date(attributes.date).toLocaleDateString()}</Typography>
          </Box>

          {attributes.doctorName && (
            <Box>
              <Typography variant='body2' color='text.secondary' mb={0.5}>Doctor</Typography>
              <Typography variant='body1'>{attributes.doctorName}</Typography>
            </Box>
          )}

          <Divider />

          <Box>
            <Typography variant='body2' color='text.secondary' mb={0.5}>Notes</Typography>
            <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
              {attributes.notes ?? '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Created: {new Date(attributes.createdAt).toLocaleString()}
            </Typography>
            <Typography variant='caption' color='text.secondary'>•</Typography>
            <Typography variant='caption' color='text.secondary'>
              Updated: {new Date(attributes.updatedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
