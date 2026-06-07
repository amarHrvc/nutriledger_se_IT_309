'use client'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import {
  formatBoolean,
  formatSocioeconomicLabel,
  type SocioeconomicAttributes
} from '@/utils/socioeconomic'

type Props = {
  data: SocioeconomicAttributes | null
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant='body2' color='text.secondary' className='mb-1'>
        {label}
      </Typography>
      <Typography variant='body1'>{value}</Typography>
    </Grid>
  )
}

export default function SocioeconomicDetail({ data }: Props) {
  if (!data) {
    return (
      <Typography color='text.secondary'>
        No socioeconomic information recorded yet.
      </Typography>
    )
  }

  return (
    <Grid container spacing={3}>
      <Field
        label='Employment status'
        value={formatSocioeconomicLabel('employment_status', data.employmentStatus)}
      />
      <Field label='Occupation' value={data.occupation || '—'} />
      <Field
        label='Income level'
        value={formatSocioeconomicLabel('income_level', data.incomeLevel)}
      />
      <Field
        label='Education level'
        value={formatSocioeconomicLabel('education_level', data.educationLevel)}
      />
      <Field
        label='Marital status'
        value={formatSocioeconomicLabel('marital_status', data.maritalStatus)}
      />
      <Field
        label='Living arrangement'
        value={formatSocioeconomicLabel('living_arrangement', data.livingArrangement)}
      />
      <Field
        label='Dependents'
        value={
          data.numberOfDependents !== null && data.numberOfDependents !== undefined
            ? String(data.numberOfDependents)
            : '—'
        }
      />
      <Field label='Health insurance' value={formatBoolean(data.hasHealthInsurance)} />
      <Field label='Family support' value={formatBoolean(data.hasFamilySupport)} />
      <Field label='Has caregiver' value={formatBoolean(data.hasCaregiver)} />
      <Field
        label='Smoking status'
        value={formatSocioeconomicLabel('smoking_status', data.smokingStatus)}
      />
      <Field
        label='Alcohol consumption'
        value={formatSocioeconomicLabel('alcohol_consumption', data.alcoholConsumption)}
      />
      <Field
        label='Physical activity'
        value={formatSocioeconomicLabel('physical_activity_level', data.physicalActivityLevel)}
      />
      <Field
        label='Transportation'
        value={formatSocioeconomicLabel('transportation_access', data.transportationAccess)}
      />
      <Field
        label='Food security'
        value={formatSocioeconomicLabel('food_security_status', data.foodSecurityStatus)}
      />
      <Grid item xs={12}>
        <Typography variant='body2' color='text.secondary' className='mb-1'>
          Dietary restrictions (cultural)
        </Typography>
        <Typography variant='body1'>{data.dietaryRestrictionsCultural || '—'}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='body2' color='text.secondary' className='mb-1'>
          Additional notes
        </Typography>
        <Typography variant='body1'>{data.additionalNotes || '—'}</Typography>
      </Grid>
    </Grid>
  )
}
