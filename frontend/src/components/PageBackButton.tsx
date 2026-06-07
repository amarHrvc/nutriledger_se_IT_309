'use client'

import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'

type PageBackButtonProps = {
  onClick: () => void
  label?: string
} & Pick<ButtonProps, 'variant' | 'color' | 'size' | 'disabled' | 'fullWidth'>

export default function PageBackButton({
  onClick,
  label = 'Back',
  variant = 'outlined',
  color,
  size,
  disabled,
  fullWidth
}: PageBackButtonProps) {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      startIcon={<i className='tabler-arrow-left' />}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

/** Stacks CardHeader actions below the title on narrow screens. */
export const responsiveCardHeaderSx: SxProps<Theme> = {
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'stretch', sm: 'center' },
  gap: { xs: 2, sm: 0 },
  '& .MuiCardHeader-action': {
    alignSelf: { xs: 'stretch', sm: 'flex-start' },
    margin: 0,
    mt: { xs: 0, sm: -1 },
    mr: { xs: 0, sm: -1 },
    width: { xs: '100%', sm: 'auto' }
  }
}

export const cardHeaderActionsSx: SxProps<Theme> = {
  display: 'flex',
  gap: 1.5,
  flexWrap: 'wrap',
  justifyContent: { xs: 'flex-start', sm: 'flex-end' },
  width: '100%'
}
