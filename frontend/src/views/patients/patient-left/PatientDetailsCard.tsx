import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { PatientResource } from '@/api/generated/nutriBaseAPI.schemas'

type Props = {
  patient: PatientResource
}

export default function PatientDetailsCard({ patient }: Props) {
  const { attributes } = patient

  return (
    <Card>
      <CardHeader title={attributes.fullName} subheader={`Patient #${patient.id}`} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant='body2' color='text.secondary'>
              Date of Birth
            </Typography>
            <Typography variant='body1'>
              {new Date(attributes.dateOfBirth).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant='body2' color='text.secondary'>
              Gender
            </Typography>
            <Chip label={attributes.gender === 'M' ? 'Male' : 'Female'} size='small' />
          </Grid>

          {attributes.bloodType && (
            <Grid item xs={6} sm={3}>
              <Typography variant='body2' color='text.secondary'>
                Blood Type
              </Typography>
              <Typography variant='body1'>{attributes.bloodType}</Typography>
            </Grid>
          )}

          {attributes.phone && (
            <Grid item xs={6} sm={3}>
              <Typography variant='body2' color='text.secondary'>
                Phone
              </Typography>
              <Typography variant='body1'>{attributes.phone}</Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
