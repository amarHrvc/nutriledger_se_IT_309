'use client'

import { useCallback, useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

type ConfirmOptions = {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success'
}

type ConfirmState = {
  open: boolean
  options: ConfirmOptions
  resolve: ((value: boolean) => void) | null
}

const initialState: ConfirmState = {
  open: false,
  options: { message: '' },
  resolve: null
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(initialState)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setState({ open: true, options, resolve })
    })
  }, [])

  const handleClose = (result: boolean) => {
    state.resolve?.(result)
    setState(initialState)
  }

  const ConfirmDialog = () => (
    <Dialog open={state.open} onClose={() => handleClose(false)} maxWidth='xs' fullWidth>
      <DialogTitle>{state.options.title ?? 'Confirm'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{state.options.message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant='tonal' color='secondary' onClick={() => handleClose(false)}>
          {state.options.cancelLabel ?? 'Cancel'}
        </Button>
        <Button
          variant='contained'
          color={state.options.confirmColor ?? 'primary'}
          onClick={() => handleClose(true)}
        >
          {state.options.confirmLabel ?? 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  )

  return { confirm, ConfirmDialog }
}
