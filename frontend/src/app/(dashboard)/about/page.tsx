'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

import NutriLedgerLogo from '@core/svg/Logo'
import themeConfig from '@configs/themeConfig'

const capabilities = [
  'Secure login with role-based access for administrators, doctors, and patients',
  'Centralized patient profiles including health details and contact information',
  'Socioeconomic data tracking to support nutrition and care planning',
  'Visit history for documenting encounters and follow-ups over time'
]

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

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent className='p-6 md:p-8'>
            <Typography variant='h5' className='mb-4'>
              What is Nutri-ledger?
            </Typography>
            <Typography color='text.secondary' className='mb-4' paragraph>
              Nutri-ledger is a web application built for clinics that need a single place to manage patient
              nutrition-related records. It helps staff keep track of who they are caring for, what socioeconomic
              factors may affect treatment, and when patients have been seen.
            </Typography>
            <Typography color='text.secondary' className='mb-4' paragraph>
              Doctors and administrators can create and update patient records, log visits, and review history from
              one dashboard. Patients can sign in to view their own information and visit timeline without needing
              staff to relay updates manually.
            </Typography>
            <Typography color='text.secondary' paragraph>
              The goal is straightforward: less paperwork, fewer scattered spreadsheets, and a clearer picture of each
              patient&apos;s journey for everyone involved in their care.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card className='bs-full'>
          <CardContent className='p-6'>
            <Typography variant='h6' className='mb-4'>
              Key capabilities
            </Typography>
            <Divider className='mb-4' />
            <List disablePadding>
              {capabilities.map(item => (
                <ListItem key={item} disableGutters className='py-2 items-start'>
                  <ListItemIcon className='min-is-8 mt-1'>
                    <i className='tabler-check text-success' />
                  </ListItemIcon>
                  <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
