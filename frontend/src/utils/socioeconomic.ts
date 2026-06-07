export type SocioeconomicAttributes = {
  maritalStatus: string | null
  numberOfDependents: number | null
  livingArrangement: string | null
  employmentStatus: string | null
  occupation: string | null
  incomeLevel: string | null
  hasHealthInsurance: boolean | null
  educationLevel: string | null
  smokingStatus: string | null
  alcoholConsumption: string | null
  physicalActivityLevel: string | null
  hasFamilySupport: boolean | null
  hasCaregiver: boolean | null
  transportationAccess: string | null
  foodSecurityStatus: string | null
  dietaryRestrictionsCultural: string | null
  additionalNotes: string | null
}

export type SocioeconomicFormData = {
  marital_status: string
  number_of_dependents: string
  living_arrangement: string
  employment_status: string
  occupation: string
  income_level: string
  has_health_insurance: string
  education_level: string
  smoking_status: string
  alcohol_consumption: string
  physical_activity_level: string
  has_family_support: string
  has_caregiver: string
  transportation_access: string
  food_security_status: string
  dietary_restrictions_cultural: string
  additional_notes: string
}

export const emptySocioeconomicForm = (): SocioeconomicFormData => ({
  marital_status: '',
  number_of_dependents: '',
  living_arrangement: '',
  employment_status: '',
  occupation: '',
  income_level: '',
  has_health_insurance: '',
  education_level: '',
  smoking_status: '',
  alcohol_consumption: '',
  physical_activity_level: '',
  has_family_support: '',
  has_caregiver: '',
  transportation_access: '',
  food_security_status: '',
  dietary_restrictions_cultural: '',
  additional_notes: ''
})

/** Maps legacy DB/seed values to canonical form option values. */
const LEGACY_TO_CANONICAL: Partial<Record<keyof SocioeconomicFormData, Record<string, string>>> = {
  education_level: {
    bachelor: 'bachelors',
    master: 'masters'
  },
  food_security_status: {
    secure: 'food_secure',
    at_risk: 'marginally_secure',
    insecure: 'food_insecure'
  },
  physical_activity_level: {
    light: 'lightly_active',
    moderate: 'moderately_active',
    active: 'very_active'
  },
  smoking_status: {
    current: 'current_light'
  },
  living_arrangement: {
    shared: 'shared_housing',
    institution: 'care_facility'
  },
  employment_status: {
    disabled: 'unable_to_work'
  },
  transportation_access: {
    family: 'limited'
  },
  marital_status: {
    partnered: 'other'
  }
}

function normalizeFormValue(field: keyof SocioeconomicFormData, value: string | null | undefined): string {
  if (!value) return ''
  return LEGACY_TO_CANONICAL[field]?.[value] ?? value
}

export function socioeconomicFromAttributes(
  attrs?: SocioeconomicAttributes | null
): SocioeconomicFormData {
  if (!attrs) return emptySocioeconomicForm()

  return {
    marital_status: normalizeFormValue('marital_status', attrs.maritalStatus),
    number_of_dependents:
      attrs.numberOfDependents !== null && attrs.numberOfDependents !== undefined
        ? String(attrs.numberOfDependents)
        : '',
    living_arrangement: normalizeFormValue('living_arrangement', attrs.livingArrangement),
    employment_status: normalizeFormValue('employment_status', attrs.employmentStatus),
    occupation: attrs.occupation ?? '',
    income_level: normalizeFormValue('income_level', attrs.incomeLevel),
    has_health_insurance: boolToSelect(attrs.hasHealthInsurance),
    education_level: normalizeFormValue('education_level', attrs.educationLevel),
    smoking_status: normalizeFormValue('smoking_status', attrs.smokingStatus),
    alcohol_consumption: normalizeFormValue('alcohol_consumption', attrs.alcoholConsumption),
    physical_activity_level: normalizeFormValue('physical_activity_level', attrs.physicalActivityLevel),
    has_family_support: boolToSelect(attrs.hasFamilySupport),
    has_caregiver: boolToSelect(attrs.hasCaregiver),
    transportation_access: normalizeFormValue('transportation_access', attrs.transportationAccess),
    food_security_status: normalizeFormValue('food_security_status', attrs.foodSecurityStatus),
    dietary_restrictions_cultural: attrs.dietaryRestrictionsCultural ?? '',
    additional_notes: attrs.additionalNotes ?? ''
  }
}

function boolToSelect(value: boolean | null | undefined): string {
  if (value === true) return 'true'
  if (value === false) return 'false'
  return ''
}

export function buildSocioeconomicPayload(
  form: SocioeconomicFormData
): Record<string, string | number | boolean> | undefined {
  const payload: Record<string, string | number | boolean> = {}

  const setString = (key: keyof SocioeconomicFormData) => {
    const value = form[key].trim()
    if (value) payload[key] = value
  }

  const setBool = (key: 'has_health_insurance' | 'has_family_support' | 'has_caregiver') => {
    if (form[key] === 'true') payload[key] = true
    if (form[key] === 'false') payload[key] = false
  }

  setString('marital_status')
  if (form.number_of_dependents !== '') {
    payload.number_of_dependents = Number(form.number_of_dependents)
  }
  setString('living_arrangement')
  setString('employment_status')
  setString('occupation')
  setString('income_level')
  setBool('has_health_insurance')
  setString('education_level')
  setString('smoking_status')
  setString('alcohol_consumption')
  setString('physical_activity_level')
  setBool('has_family_support')
  setBool('has_caregiver')
  setString('transportation_access')
  setString('food_security_status')
  setString('dietary_restrictions_cultural')
  setString('additional_notes')

  return Object.keys(payload).length > 0 ? payload : undefined
}

export function getSocioeconomicFromPatient(patient: {
  included?: { socioeconomic?: { attributes?: SocioeconomicAttributes } }
}): SocioeconomicAttributes | null {
  return patient.included?.socioeconomic?.attributes ?? null
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return '—'
}

export function formatSocioeconomicLabel(
  field: keyof typeof SOCIOECONOMIC_LABELS,
  value: string | number | boolean | null | undefined
): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'

  const options = SOCIOECONOMIC_LABELS[field] as Record<string, string> | undefined
  return options?.[String(value)] ?? String(value)
}

export const BOOL_OPTIONS = [
  ['true', 'Yes'],
  ['false', 'No']
] as const

export const SOCIOECONOMIC_LABELS = {
  marital_status: {
    single: 'Single',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
    separated: 'Separated',
    other: 'Other'
  },
  living_arrangement: {
    alone: 'Alone',
    with_family: 'With family',
    with_partner: 'With partner',
    shared_housing: 'Shared housing',
    care_facility: 'Care facility',
    other: 'Other'
  },
  employment_status: {
    employed_full_time: 'Employed full-time',
    employed_part_time: 'Employed part-time',
    self_employed: 'Self-employed',
    unemployed: 'Unemployed',
    retired: 'Retired',
    student: 'Student',
    unable_to_work: 'Unable to work',
    other: 'Other'
  },
  income_level: {
    low: 'Low',
    lower_middle: 'Lower middle',
    middle: 'Middle',
    upper_middle: 'Upper middle',
    high: 'High'
  },
  education_level: {
    no_formal: 'No formal education',
    primary: 'Primary',
    secondary: 'Secondary',
    vocational: 'Vocational',
    bachelors: "Bachelor's",
    bachelor: "Bachelor's",
    masters: "Master's",
    master: "Master's",
    doctorate: 'Doctorate',
    other: 'Other'
  },
  smoking_status: {
    never: 'Never',
    former: 'Former',
    current_light: 'Current (light)',
    current_heavy: 'Current (heavy)'
  },
  alcohol_consumption: {
    none: 'None',
    occasional: 'Occasional',
    moderate: 'Moderate',
    heavy: 'Heavy'
  },
  physical_activity_level: {
    sedentary: 'Sedentary',
    lightly_active: 'Lightly active',
    moderately_active: 'Moderately active',
    very_active: 'Very active'
  },
  transportation_access: {
    own_vehicle: 'Own vehicle',
    public_transport: 'Public transport',
    rideshare: 'Rideshare',
    walking: 'Walking',
    limited: 'Limited',
    none: 'None'
  },
  food_security_status: {
    food_secure: 'Food secure',
    secure: 'Food secure',
    marginally_secure: 'Marginally secure',
    at_risk: 'Marginally secure',
    food_insecure: 'Food insecure',
    insecure: 'Food insecure',
    severely_insecure: 'Severely insecure'
  }
} as const

export const SOCIOECONOMIC_SELECTS = {
  marital_status: Object.entries(SOCIOECONOMIC_LABELS.marital_status),
  living_arrangement: Object.entries(SOCIOECONOMIC_LABELS.living_arrangement),
  employment_status: Object.entries(SOCIOECONOMIC_LABELS.employment_status),
  income_level: Object.entries(SOCIOECONOMIC_LABELS.income_level),
  education_level: Object.entries(SOCIOECONOMIC_LABELS.education_level),
  smoking_status: Object.entries(SOCIOECONOMIC_LABELS.smoking_status),
  alcohol_consumption: Object.entries(SOCIOECONOMIC_LABELS.alcohol_consumption),
  physical_activity_level: Object.entries(SOCIOECONOMIC_LABELS.physical_activity_level),
  transportation_access: Object.entries(SOCIOECONOMIC_LABELS.transportation_access),
  food_security_status: Object.entries(SOCIOECONOMIC_LABELS.food_security_status)
}
