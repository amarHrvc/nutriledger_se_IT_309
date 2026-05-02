'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Login200 } from '@/api/generated/nutriBaseAPI.schemas'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

import { client } from '@/api/client'
import { ApiError } from '@/api/client'

// Styled Custom Components
const IllustrationWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(6),
  padding: theme.spacing(12),
  zIndex: 2
}))

const IconWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  marginBottom: theme.spacing(4)
}))

const FeatureIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontSize: '2.5rem',
  boxShadow: theme.shadows[4]
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <IllustrationWrapper>
          <div className='text-center'>
            <Typography variant='h3' className='font-bold mb-2' color='primary'>
              Nutri-ledger
            </Typography>
            <Typography variant='h6' color='text.secondary' className='mb-8'>
              Patient Management System
            </Typography>
          </div>
          
          <IconWrapper>
            <FeatureIcon>
              <i className='tabler-users' />
            </FeatureIcon>
            <FeatureIcon>
              <i className='tabler-heart-rate-monitor' />
            </FeatureIcon>
            <FeatureIcon>
              <i className='tabler-clipboard-text' />
            </FeatureIcon>
          </IconWrapper>

          <div className='text-center max-w-md'>
            <Typography variant='body1' color='text.secondary' className='mb-4'>
              Comprehensive patient record management for healthcare professionals
            </Typography>
            <div className='flex flex-col gap-2 text-left'>
              <div className='flex items-center gap-2'>
                <i className='tabler-check text-success' />
                <Typography variant='body2' color='text.secondary'>
                  Secure patient data management
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-check text-success' />
                <Typography variant='body2' color='text.secondary'>
                  Track visits and medical history
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-check text-success' />
                <Typography variant='body2' color='text.secondary'>
                  Nutritional and socioeconomic insights
                </Typography>
              </div>
            </div>
          </div>
        </IllustrationWrapper>
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Please sign in to your account to continue</Typography>
          </div>
          {error ? <Alert severity='error'>{error}</Alert> : null}
          <form
            noValidate
            autoComplete='off'
            onSubmit={async e => {
              e.preventDefault()
              setError(null)
              setFieldErrors(null)
              setIsSubmitting(true)

              try {
                const res = await client.post<Login200>('api/login', { email, password })

                const token = res?.data?.token

                if (!token) {
                  setError('Login failed: server did not return a token.')
                  return
                }

                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(res?.data?.user ?? null))

                router.replace('/home')
              } catch (err) {
                if (err instanceof ApiError) {
                  // 422 validation errors come as { message, errors: { field: [..] } }
                  if (err.status === 422 && err.payload?.errors) {
                    setError(err.payload.message ?? 'Please fix the highlighted errors.')
                    setFieldErrors(err.payload.errors)
                  } else if (err.status === 401) {
                    // For 401 errors, prefer the message from payload (backend response)
                    setError(err.payload?.message || err.message || 'Invalid credentials.')
                  } else if (err.status === 0) {
                    setError(err.message)
                  } else {
                    // For other errors, show payload message if available
                    setError(err.payload?.message || err.message || `Request failed (HTTP ${err.status})`)
                  }
                } else {
                  const message = err instanceof Error ? err.message : 'Login failed'
                  setError(message)
                }
              } finally {
                setIsSubmitting(false)
              }
            }}
            className='flex flex-col gap-5'
          >
            <CustomTextField
              autoFocus
              fullWidth
              label='Email'
              placeholder='Enter your email'
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (fieldErrors?.email) {
                  setFieldErrors(prev => prev ? { ...prev, email: undefined } : null)
                }
              }}
              error={!!fieldErrors?.email}
              helperText={fieldErrors?.email?.[0]}
            />
            <CustomTextField
              fullWidth
              label='Password'
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (fieldErrors?.password) {
                  setFieldErrors(prev => prev ? { ...prev, password: undefined } : null)
                }
              }}
              error={!!fieldErrors?.password}
              helperText={fieldErrors?.password?.[0]}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox />} label='Remember me' />
              <Typography className='text-end' color='primary.main' component={Link}>
                Forgot password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting || !email || !password}>
              {isSubmitting ? <CircularProgress size={18} /> : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
