import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import type { VisitResource } from '@/api/generated/nutriBaseAPI.schemas'

type Props = {
  visit: VisitResource
  onUpdated: () => void
}

export default function VisitDetail({ visit }: Props) {
  const { attributes } = visit

  return (
    <Card>
      <CardHeader title='Visit Details' />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant='body2' color='text.secondary' mb={0.5}>
              Date
            </Typography>
            <Typography variant='body1'>{new Date(attributes.date).toLocaleDateString()}</Typography>
          </Box>

          {attributes.doctorName && (
            <Box>
              <Typography variant='body2' color='text.secondary' mb={0.5}>
                Doctor
              </Typography>
              <Typography variant='body1'>{attributes.doctorName}</Typography>
            </Box>
          )}

          <Divider />

          <Box>
            <Typography variant='body2' color='text.secondary' mb={0.5}>
              Notes
            </Typography>
            <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
              {attributes.notes ?? '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Created: {new Date(attributes.createdAt).toLocaleString()}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              •
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Updated: {new Date(attributes.updatedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
