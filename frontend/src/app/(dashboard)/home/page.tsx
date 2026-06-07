'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'
import type { ThemeColor } from '@core/types'
import themeConfig from '@configs/themeConfig'
import { client, ApiError } from '@/api/client'
import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'
import { getInitials } from '@/utils/getInitials'
import { PATIENTS_NAV } from '@/utils/patientNav'

type PaginatedResponse = {
  data: unknown[]
  meta?: { total?: number }
}

type RawPatient = {
  id?: number
  first_name?: string
  last_name?: string
  firstName?: string
  lastName?: string
  date_of_birth?: string
  dateOfBirth?: string
  phone?: string | null
}

type DashboardStats = {
  totalPatients: number
  totalUsers: number
}

const StatCard = ({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: number | string
  icon: string
  color: ThemeColor
}) => (
  <Card className='bs-full'>
    <CardContent className='flex items-center justify-between gap-4'>
      <div>
        <Typography variant='body2' color='text.secondary'>
          {title}
        </Typography>
        <Typography variant='h4' className='font-medium'>
          {value}
        </Typography>
      </div>
      <CustomAvatar skin='light' color={color} size={42}>
        <i className={icon} />
      </CustomAvatar>
    </CardContent>
  </Card>
)

const roleChipColor = (role: string): ThemeColor => {
  if (role === 'admin') return 'error'
  if (role === 'doktor') return 'info'

  return 'success'
}

const formatRole = (role: string): string => {
  if (role === 'doktor') return 'Doctor'
  if (role === 'pacijent') return 'Patient'
  if (role === 'admin') return 'Admin'

  return role
}

const getPatientName = (patient: RawPatient) => {
  const first = patient.firstName ?? patient.first_name ?? ''
  const last = patient.lastName ?? patient.last_name ?? ''

  return `${first} ${last}`.trim() || '—'
}

const getPatientDob = (patient: RawPatient) => patient.dateOfBirth ?? patient.date_of_birth

const isStaff = (role: string) => role === 'admin' || role === 'doktor'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserResource | null>(null)
  const [stats, setStats] = useState<DashboardStats>({ totalPatients: 0, totalUsers: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        const userRes = await client.get<{ data: { user: UserResource } }>('api/user')
        const currentUser = userRes.data.user

        setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))

        if (isStaff(currentUser.attributes.role)) {
          const patientsRes = await client.get<PaginatedResponse>('api/patients?per_page=1')
          const nextStats: DashboardStats = {
            totalPatients: patientsRes.meta?.total ?? patientsRes.data.length,
            totalUsers: 0
          }

          if (currentUser.attributes.role === 'admin') {
            try {
              const usersRes = await client.get<PaginatedResponse>('api/users?per_page=1')
              nextStats.totalUsers = usersRes.meta?.total ?? usersRes.data.length
            } catch {
              nextStats.totalUsers = 0
            }
          }

          setStats(nextStats)
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to load dashboard')
        }
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>
  }

  if (!user) {
    return <Alert severity='warning'>No user data available</Alert>
  }

  const patient = user.relationships.patient as RawPatient | undefined
  const role = user.attributes.role
  const showStaffStats = isStaff(role)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div>
          <Typography variant='h4' className='mb-1'>
            {`Welcome back, ${user.attributes.name}`}
          </Typography>
          <Typography color='text.secondary'>
            {`${themeConfig.templateName} — your clinic nutrition management dashboard.`}
          </Typography>
        </div>
      </Grid>

      {showStaffStats && (
        <>
          <Grid size={{ xs: 12, sm: 6, md: role === 'admin' ? 6 : 12 }}>
            <StatCard title='Total Patients' value={stats.totalPatients} icon='tabler-users' color='primary' />
          </Grid>
          {role === 'admin' && (
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <StatCard title='Total Users' value={stats.totalUsers} icon='tabler-user-check' color='info' />
            </Grid>
          )}
        </>
      )}

      <Grid size={{ xs: 12, md: 5 }}>
        <Card className='bs-full'>
          <CardHeader
            title='Your Profile'
            avatar={
              <CustomAvatar skin='light' color='primary' size={38}>
                <i className='tabler-user' />
              </CustomAvatar>
            }
          />
          <Divider />
          <CardContent>
            <div className='flex items-center gap-4 mb-6'>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {getInitials(user.attributes.name)}
              </Avatar>
              <div>
                <Typography variant='h6'>{user.attributes.name}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {user.attributes.email}
                </Typography>
                <Chip label={formatRole(role)} color={roleChipColor(role)} size='small' className='mt-2' />
              </div>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='flex justify-between gap-4'>
                <Typography variant='body2' color='text.secondary'>
                  Member since
                </Typography>
                <Typography variant='body2'>{new Date(user.attributes.createdAt).toLocaleDateString()}</Typography>
              </div>
              <div className='flex justify-between gap-4'>
                <Typography variant='body2' color='text.secondary'>
                  Last updated
                </Typography>
                <Typography variant='body2'>{new Date(user.attributes.updatedAt).toLocaleDateString()}</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: patient ? 4 : 7 }}>
        <Card className='bs-full'>
          <CardHeader title='Quick Actions' subheader='Common tasks' />
          <Divider />
          <CardContent className='flex flex-col gap-3'>
            {showStaffStats && (
              <>
                <Button
                  fullWidth
                  variant='contained'
                  startIcon={<i className='tabler-users' />}
                  onClick={() => router.push('/patients')}
                >
                  View Patients
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push('/patients/create')}
                >
                  Add Patient
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  startIcon={<i className='tabler-calendar-event' />}
                  onClick={() => router.push('/visits')}
                >
                  View Visits
                </Button>
              </>
            )}
            {role === 'pacijent' && (
              <><Button
                fullWidth
                variant='outlined'
                startIcon={<i className={PATIENTS_NAV.icon} />}
                onClick={() => router.push('/patients')}
              >
                {PATIENTS_NAV.patientLabel}
              </Button><Button
                fullWidth
                variant='contained'
                startIcon={<i className='tabler-calendar-event' />}
                onClick={() => router.push('/visits')}
              >
                  My Visits
                </Button></>
            )}
            <Button
              fullWidth
              variant='tonal'
              startIcon={<i className='tabler-info-circle' />}
              onClick={() => router.push('/about')}
            >
              About Nutri-ledger
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {patient && (
        <Grid size={{ xs: 12, md: 3 }}>
          <Card className='bs-full'>
            <CardHeader
              title='Patient Record'
              avatar={
                <CustomAvatar skin='light' color='success' size={38}>
                  <i className='tabler-heart-rate-monitor' />
                </CustomAvatar>
              }
            />
            <Divider />
            <CardContent>
              <div className='flex flex-col gap-3'>
                <div>
                  <Typography variant='body2' color='text.secondary'>
                    Name
                  </Typography>
                  <Typography variant='body1'>{getPatientName(patient)}</Typography>
                </div>
                {getPatientDob(patient) && (
                  <div>
                    <Typography variant='body2' color='text.secondary'>
                      Date of birth
                    </Typography>
                    <Typography variant='body1'>
                      {new Date(getPatientDob(patient)!).toLocaleDateString()}
                    </Typography>
                  </div>
                )}
                {patient.phone && (
                  <div>
                    <Typography variant='body2' color='text.secondary'>
                      Phone
                    </Typography>
                    <Typography variant='body1'>{patient.phone}</Typography>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}
