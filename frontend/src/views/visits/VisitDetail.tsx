'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import type { VisitResource } from '@/api/generated/nutriBaseAPI.schemas'
import VisitEditForm from './VisitEditForm'

type Props = {
  visit: VisitResource
  patientId: string
  onUpdated: () => void
}

export default function VisitDetail({ visit, patientId, onUpdated }: Props) {
  const [editing, setEditing] = useState(false)
  const { attributes } = visit

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
          <Button size='small' variant='outlined' startIcon={<i className='tabler-edit' />} onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
