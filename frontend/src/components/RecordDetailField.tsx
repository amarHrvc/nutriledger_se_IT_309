'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

export function SectionTitle({ children, icon }: { children: string; icon?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      {icon && <i className={`${icon} text-lg text-primary`} />}
      <Typography
        variant='overline'
        sx={{ color: 'text.secondary', letterSpacing: '1px', fontSize: '0.7rem', lineHeight: 1 }}
      >
        {children}
      </Typography>
    </Box>
  )
}

type DetailFieldProps = {
  label: string
  value: React.ReactNode
  fullWidth?: boolean
}

export function DetailField({ label, value, fullWidth }: DetailFieldProps) {
  const display =
    value === null || value === undefined || value === '' || value === '—' ? (
      <Typography variant='body1' color='text.disabled'>
        —
      </Typography>
    ) : (
      value
    )

  return (
    <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6, lg: fullWidth ? 12 : 4 }}>
      <Box
        sx={{
          p: 2.5,
          height: '100%',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover'
        }}
      >
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', mb: 0.75, fontWeight: 600, letterSpacing: '0.3px' }}
        >
          {label}
        </Typography>
        {typeof display === 'string' ? <Typography variant='body1'>{display}</Typography> : display}
      </Box>
    </Grid>
  )
}

export function BooleanValue({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) {
    return (
      <Typography variant='body1' color='text.disabled'>
        —
      </Typography>
    )
  }

  return (
    <Chip
      label={value ? 'Yes' : 'No'}
      size='small'
      color={value ? 'success' : 'default'}
      variant='tonal'
    />
  )
}
