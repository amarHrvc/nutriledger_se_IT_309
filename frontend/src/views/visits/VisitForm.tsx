'use client'

import { useState, useEffect } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

import { client, ApiError } from '@/api/client'
import type { PatientResource } from '@/api/generated/nutriBaseAPI.schemas'

type PatientListResponse = { message: string; status: number; data: PatientResource[] }

interface Patient {
	id: string
	attributes: {
		fullName: string
	}
}

interface Doctor {
	id: string
	attributes: {
		name: string
		role: string
	}
}

interface Props {
	patientId?: string
	onSuccess?: () => void
	onCancel?: () => void
}

export default function VisitForm({ patientId, onSuccess, onCancel }: Props) {
	const [datetimeValue, setDatetimeValue] = useState('')
	const [notes, setNotes] = useState('')
	const [selectedPatientId, setSelectedPatientId] = useState(patientId || '')
	const [selectedDoctorId, setSelectedDoctorId] = useState('')
	const [patients, setPatients] = useState<Patient[]>([])
	const [doctors, setDoctors] = useState<Doctor[]>([])
	const [patientsLoading, setPatientsLoading] = useState(true)
	const [doctorsLoading, setDoctorsLoading] = useState(true)

	const [errors, setErrors] = useState<Record<string, string[]>>({})
	const [formError, setFormError] = useState('')
	const [loading, setLoading] = useState(false)

	const fieldError = (field: string) => errors[field]?.[0]

	// Fetch patients on mount
	useEffect(() => {
		const fetchPatients = async () => {
			try {
				const res = await client.get<PatientListResponse>('api/patients')
				setPatients(res.data ?? [])
			} catch (err) {
				setFormError(err instanceof ApiError ? err.message : 'Failed to load patients.')
			} finally {
				setPatientsLoading(false)
			}
		}
		fetchPatients()
	}, [])

	useEffect(() => {
		setDoctorsLoading(false)
	}, [])

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setErrors({})
		setFormError('')

		const resolvedPatientId = patientId || selectedPatientId

		if (!resolvedPatientId) {
			setFormError('Please select a patient.')
			setLoading(false)

return
		}

		try {
			// Split datetime-local format: "2025-01-15T14:30" -> ["2025-01-15", "14:30"]
			const [date, time] = datetimeValue.split('T')

			const payload: Record<string, any> = {
				date,
				time,
				notes,
			}


			await client.post(`api/patients/${resolvedPatientId}/visits`, payload)
			window.dispatchEvent(new CustomEvent('visits:changed'))
			onSuccess?.()
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.payload?.errors) setErrors(err.payload.errors)
				else setFormError(err.message)
			} else {
				setFormError('Failed to create visit.')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box component='form' onSubmit={submit} noValidate>
			<Stack spacing={3} sx={{ pt: 1 }}>
				{formError && <Alert severity='error'>{formError}</Alert>}

				{/* Show patient select only if patientId prop is not provided */}
				{!patientId && (
					<FormControl fullWidth required error={!!fieldError('patient_id')} disabled={patientsLoading}>
						<InputLabel>Patient</InputLabel>
						<Select
							value={selectedPatientId}
							label='Patient'
							onChange={e => setSelectedPatientId(e.target.value)}
						>
							{patients.map(patient => (
								<MenuItem key={patient.id} value={patient.id}>
									{patient.attributes.fullName}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				)}


				{/* DateTime field */}
				<TextField
					label='Date & Time'
					type='datetime-local'
					value={datetimeValue}
					onChange={e => setDatetimeValue(e.target.value)}
					error={!!fieldError('date') || !!fieldError('time')}
					helperText={fieldError('date') || fieldError('time')}
					fullWidth
					required
					InputLabelProps={{ shrink: true }}
				/>

				{/* Notes field */}
				<TextField
					label='Notes'
					value={notes}
					onChange={e => setNotes(e.target.value)}
					error={!!fieldError('notes')}
					helperText={fieldError('notes')}
					fullWidth
					multiline
					rows={3}
				/>

				{/* Action buttons */}
				<Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
					{onCancel && (
						<Button variant='outlined' onClick={onCancel} disabled={loading || patientsLoading || doctorsLoading}>
							Cancel
						</Button>
					)}
					<Button type='submit' variant='contained' disabled={loading || patientsLoading || doctorsLoading} startIcon={loading ? <CircularProgress size={16} /> : null}>
						Create Visit
					</Button>
				</Box>
			</Stack>
		</Box>
	)
}
