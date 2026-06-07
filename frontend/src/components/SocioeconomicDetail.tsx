'use client'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { BooleanValue, DetailField, SectionTitle } from '@/components/RecordDetailField'
import {
  formatSocioeconomicLabel,
  type SocioeconomicAttributes
} from '@/utils/socioeconomic'

type Props = {
  data: SocioeconomicAttributes | null
}

function hasAnyValue(...values: Array<string | number | boolean | null | undefined>): boolean {
  return values.some(v => v !== null && v !== undefined && v !== '')
}

export default function SocioeconomicDetail({ data }: Props) {
  if (!data) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'action.hover'
        }}
      >
        <Typography color='text.secondary'>
          No socioeconomic information recorded yet.
        </Typography>
      </Box>
    )
  }

  const notesBlock = (label: string, text: string | null) =>
    text ? (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover'
        }}
      >
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', mb: 1, fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
          {text}
        </Typography>
      </Box>
    ) : null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {hasAnyValue(
        data.employmentStatus,
        data.occupation,
        data.incomeLevel,
        data.educationLevel
      ) && (
        <Box>
          <SectionTitle icon='tabler-briefcase'>Employment & Income</SectionTitle>
          <Grid container spacing={3}>
            <DetailField
              label='Employment status'
              value={formatSocioeconomicLabel('employment_status', data.employmentStatus)}
            />
            <DetailField label='Occupation' value={data.occupation} />
            <DetailField
              label='Income level'
              value={formatSocioeconomicLabel('income_level', data.incomeLevel)}
            />
            <DetailField
              label='Education level'
              value={formatSocioeconomicLabel('education_level', data.educationLevel)}
            />
          </Grid>
        </Box>
      )}

      {hasAnyValue(
        data.maritalStatus,
        data.livingArrangement,
        data.numberOfDependents,
        data.hasHealthInsurance,
        data.hasFamilySupport,
        data.hasCaregiver
      ) && (
        <Box>
          <SectionTitle icon='tabler-home'>Household & Living</SectionTitle>
          <Grid container spacing={3}>
            <DetailField
              label='Marital status'
              value={formatSocioeconomicLabel('marital_status', data.maritalStatus)}
            />
            <DetailField
              label='Living arrangement'
              value={formatSocioeconomicLabel('living_arrangement', data.livingArrangement)}
            />
            <DetailField
              label='Dependents'
              value={
                data.numberOfDependents !== null && data.numberOfDependents !== undefined
                  ? String(data.numberOfDependents)
                  : null
              }
            />
            <DetailField label='Health insurance' value={<BooleanValue value={data.hasHealthInsurance} />} />
            <DetailField label='Family support' value={<BooleanValue value={data.hasFamilySupport} />} />
            <DetailField label='Has caregiver' value={<BooleanValue value={data.hasCaregiver} />} />
          </Grid>
        </Box>
      )}

      {hasAnyValue(
        data.smokingStatus,
        data.alcoholConsumption,
        data.physicalActivityLevel,
        data.transportationAccess,
        data.foodSecurityStatus
      ) && (
        <Box>
          <SectionTitle icon='tabler-heartbeat'>Lifestyle & Food Security</SectionTitle>
          <Grid container spacing={3}>
            <DetailField
              label='Smoking status'
              value={formatSocioeconomicLabel('smoking_status', data.smokingStatus)}
            />
            <DetailField
              label='Alcohol consumption'
              value={formatSocioeconomicLabel('alcohol_consumption', data.alcoholConsumption)}
            />
            <DetailField
              label='Physical activity'
              value={formatSocioeconomicLabel('physical_activity_level', data.physicalActivityLevel)}
            />
            <DetailField
              label='Transportation'
              value={formatSocioeconomicLabel('transportation_access', data.transportationAccess)}
            />
            <DetailField
              label='Food security'
              value={formatSocioeconomicLabel('food_security_status', data.foodSecurityStatus)}
            />
          </Grid>
        </Box>
      )}

      {(data.dietaryRestrictionsCultural || data.additionalNotes) && (
        <Box>
          <SectionTitle icon='tabler-notes'>Additional Information</SectionTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {notesBlock('Dietary restrictions (cultural)', data.dietaryRestrictionsCultural)}
            {notesBlock('Additional notes', data.additionalNotes)}
          </Box>
        </Box>
      )}
    </Box>
  )
}
