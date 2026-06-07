'use client'

import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

import type { PaginationMeta } from '@/types/pagination'

type Props = {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  disabled?: boolean
}

export default function ListPagination({ meta, onPageChange, disabled }: Props) {
  if (meta.total === 0 || meta.last_page <= 1) {
    return null
  }

  const rangeLabel =
    meta.from != null && meta.to != null
      ? `Showing ${meta.from}–${meta.to} of ${meta.total}`
      : `${meta.total} total`

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        px: 4,
        py: 3
      }}
    >
      <Typography variant='body2' color='text.secondary'>
        {rangeLabel}
      </Typography>
      <Pagination
        count={meta.last_page}
        page={meta.current_page}
        onChange={(_, page) => onPageChange(page)}
        color='primary'
        shape='rounded'
        disabled={disabled}
      />
    </Box>
  )
}
