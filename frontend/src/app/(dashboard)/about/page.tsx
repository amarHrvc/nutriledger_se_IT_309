'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import NutriLedgerLogo from '@core/svg/Logo'
import themeConfig from '@configs/themeConfig'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex items-center gap-4 mb-2'>
          <NutriLedgerLogo className='text-5xl text-primary shrink-0' />
          <div>
            <Typography variant='h4'>{themeConfig.templateName}</Typography>
            <Typography color='text.secondary'>Clinic nutrition management platform</Typography>
          </div>
        </div>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='p-6 md:p-8'>
            <Typography variant='h5' className='mb-4'>
              What is Nutri-ledger?
            </Typography>
            <Typography color='text.secondary' className='mb-4' paragraph>
              Nutri-ledger is a web application built for clinics that need a single place to manage patient
              nutrition-related records. It helps staff keep track of who they are caring for, when patients
              have been seen, and socioeconomic factors that affect nutrition and care planning.
            </Typography>
            <Typography color='text.secondary' className='mb-4' paragraph>
              Doctors and administrators can create and update patient records (including employment, lifestyle,
              and food security data), log visits, and review history from one dashboard. Patients can sign in to
              view their own information and visit timeline without needing staff to relay updates manually.
            </Typography>
            <Typography color='text.secondary' paragraph>
              The goal is straightforward: less paperwork, fewer scattered spreadsheets, and a clearer picture of each
              patient&apos;s journey for everyone involved in their care.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
