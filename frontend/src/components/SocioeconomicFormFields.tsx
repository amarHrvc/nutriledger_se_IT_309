'use client'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import {
  BOOL_OPTIONS,
  SOCIOECONOMIC_SELECTS,
  type SocioeconomicFormData
} from '@/utils/socioeconomic'

type Props = {
  formData: SocioeconomicFormData
  onChange: (field: keyof SocioeconomicFormData, value: string) => void
  fieldErrors?: Record<string, string[]> | null
}

const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    variant='overline'
    sx={{ display: 'block', mb: 3, color: 'text.secondary', letterSpacing: '1px', fontSize: '0.7rem' }}
  >
    {children}
  </Typography>
)

function fe(fieldErrors: Record<string, string[]> | null | undefined, key: string) {
  const apiKey = `socioeconomic.${key}`
  return {
    error: !!fieldErrors?.[apiKey],
    helperText: fieldErrors?.[apiKey]?.[0]
  }
}

function SelectField({
  label,
  field,
  options,
  formData,
  onChange,
  fieldErrors
}: {
  label: string
  field: keyof SocioeconomicFormData
  options: readonly (readonly [string, string])[]
  formData: SocioeconomicFormData
  onChange: Props['onChange']
  fieldErrors?: Props['fieldErrors']
}) {
  return (
    <CustomTextField
      fullWidth
      label={label}
      select
      value={formData[field]}
      onChange={e => onChange(field, e.target.value)}
      slotProps={{ select: { native: true } }}
      {...fe(fieldErrors, field)}
    >
      <option value=''>Not specified</option>
      {options.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </CustomTextField>
  )
}

export default function SocioeconomicFormFields({ formData, onChange, fieldErrors }: Props) {
  return (
    <Box>
      <SectionTitle>Employment & Income</SectionTitle>
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Employment status'
            field='employment_status'
            options={SOCIOECONOMIC_SELECTS.employment_status}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            fullWidth
            label='Occupation'
            value={formData.occupation}
            onChange={e => onChange('occupation', e.target.value)}
            {...fe(fieldErrors, 'occupation')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Income level'
            field='income_level'
            options={SOCIOECONOMIC_SELECTS.income_level}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Education level'
            field='education_level'
            options={SOCIOECONOMIC_SELECTS.education_level}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
      </Grid>

      <SectionTitle>Household & Living</SectionTitle>
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Marital status'
            field='marital_status'
            options={SOCIOECONOMIC_SELECTS.marital_status}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Living arrangement'
            field='living_arrangement'
            options={SOCIOECONOMIC_SELECTS.living_arrangement}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            fullWidth
            label='Number of dependents'
            type='number'
            inputProps={{ min: 0, max: 20 }}
            value={formData.number_of_dependents}
            onChange={e => onChange('number_of_dependents', e.target.value)}
            {...fe(fieldErrors, 'number_of_dependents')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Health insurance'
            field='has_health_insurance'
            options={BOOL_OPTIONS.map(([value, label]) => [value, label] as const)}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Family support'
            field='has_family_support'
            options={BOOL_OPTIONS.map(([value, label]) => [value, label] as const)}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Has caregiver'
            field='has_caregiver'
            options={BOOL_OPTIONS.map(([value, label]) => [value, label] as const)}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
      </Grid>

      <SectionTitle>Lifestyle & Food Security</SectionTitle>
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Smoking status'
            field='smoking_status'
            options={SOCIOECONOMIC_SELECTS.smoking_status}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Alcohol consumption'
            field='alcohol_consumption'
            options={SOCIOECONOMIC_SELECTS.alcohol_consumption}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Physical activity'
            field='physical_activity_level'
            options={SOCIOECONOMIC_SELECTS.physical_activity_level}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Transportation access'
            field='transportation_access'
            options={SOCIOECONOMIC_SELECTS.transportation_access}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SelectField
            label='Food security'
            field='food_security_status'
            options={SOCIOECONOMIC_SELECTS.food_security_status}
            formData={formData}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            label='Dietary restrictions (cultural)'
            multiline
            rows={2}
            value={formData.dietary_restrictions_cultural}
            onChange={e => onChange('dietary_restrictions_cultural', e.target.value)}
            {...fe(fieldErrors, 'dietary_restrictions_cultural')}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            label='Additional notes'
            multiline
            rows={3}
            value={formData.additional_notes}
            onChange={e => onChange('additional_notes', e.target.value)}
            {...fe(fieldErrors, 'additional_notes')}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
