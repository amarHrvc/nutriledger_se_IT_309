'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { DetailField, SectionTitle } from '@/components/RecordDetailField'
import SocioeconomicDetail from '@/components/SocioeconomicDetail'
import CustomAvatar from '@core/components/mui/Avatar'
import { client, ApiError } from '@/api/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getPatientsNavLabel, PATIENTS_NAV } from '@/utils/patientNav'
import { getSocioeconomicFromPatient } from '@/utils/socioeconomic'

type PatientAttributes = {
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: string
  gender: string
  phone: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  emergencyContactName: string
  emergencyContactPhone: string
  bloodType: string | null
  allergies: string | null
  medicalNotes: string | null
  createdAt: string
  updatedAt: string
}

type PatientResource = {
  type: 'patient'
  id: string
  attributes: PatientAttributes
  relationships: any
  included?: { socioeconomic?: { attributes: import('@/utils/socioeconomic').SocioeconomicAttributes } }
}

type PatientResponse = {
  message: string
  status: number
  data: { patient: PatientResource }
}

function NotesField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null

  return (
    <Grid size={{ xs: 12 }}>
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
          {value}
        </Typography>
      </Box>
    </Grid>
  )
}

export default function ViewPatientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [patient, setPatient] = useState<PatientResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isPatient } = useCurrentUser()

  useEffect(() => {
    loadPatient()
  }, [id])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const res = await client.get<PatientResponse>(`api/patients/${id}`)
      setPatient(res.data.patient)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load patient')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !patient) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error || 'Patient not found'}</Alert>
          <Button variant='outlined' onClick={() => router.push('/patients')} className='mt-4'>
            {isPatient ? `Back to ${PATIENTS_NAV.patientLabel}` : `Back to ${PATIENTS_NAV.staffLabel}`}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { attributes } = patient
  const genderLabel = attributes.gender === 'M' ? 'Male' : 'Female'

  return (
    <Card>
      <CardHeader
        title={attributes.fullName}
        subheader={isPatient ? getPatientsNavLabel(true) : `Patient #${patient.id}`}
        avatar={
          <CustomAvatar skin='light' color='primary' size={44}>
            <i className={isPatient ? PATIENTS_NAV.icon : 'tabler-user'} />
          </CustomAvatar>
        }
        action={
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {attributes.bloodType && (
              <Chip label={`Blood type: ${attributes.bloodType}`} size='small' color='error' variant='tonal' />
            )}
            <Chip label={genderLabel} size='small' variant='tonal' />
            {!isPatient && (
              <Button
                variant='contained'
                size='small'
                startIcon={<i className='tabler-edit' />}
                onClick={() => router.push(`/patients/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            <Button variant='outlined' size='small' onClick={() => router.push('/patients')}>
              Back
            </Button>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ pt: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionTitle icon='tabler-id'>Personal Information</SectionTitle>
            <Grid container spacing={3}>
              <DetailField label='First name' value={attributes.firstName} />
              <DetailField label='Last name' value={attributes.lastName} />
              <DetailField
                label='Date of birth'
                value={new Date(attributes.dateOfBirth).toLocaleDateString()}
              />
              <DetailField label='Gender' value={genderLabel} />
            </Grid>

            <Box sx={{ mt: 5 }}>
              <SectionTitle icon='tabler-phone'>Contact Information</SectionTitle>
              <Grid container spacing={3}>
                <DetailField label='Phone' value={attributes.phone} />
                <DetailField label='City' value={attributes.city} />
                <DetailField label='Address' value={attributes.address} fullWidth />
                <DetailField label='Postal code' value={attributes.postalCode} />
              </Grid>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionTitle icon='tabler-phone-call'>Emergency Contact</SectionTitle>
            <Grid container spacing={3}>
              <DetailField label='Contact name' value={attributes.emergencyContactName} />
              <DetailField label='Contact phone' value={attributes.emergencyContactPhone} />
            </Grid>

            <Box sx={{ mt: 5 }}>
              <SectionTitle icon='tabler-stethoscope'>Medical Information</SectionTitle>
              <Grid container spacing={3}>
                <DetailField label='Blood type' value={attributes.bloodType} />
                <NotesField label='Allergies' value={attributes.allergies} />
                <NotesField label='Medical notes' value={attributes.medicalNotes} />
              </Grid>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ mb: 5 }} />
            <SectionTitle icon='tabler-chart-infographic'>Socioeconomic Information</SectionTitle>
            <SocioeconomicDetail data={getSocioeconomicFromPatient(patient)} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
