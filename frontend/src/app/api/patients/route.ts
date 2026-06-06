import { NextResponse } from 'next/server'

import { patientsIndex } from '@/api/generated/patient/patient'

export async function GET() {
  const res = await patientsIndex()
  return NextResponse.json(res.data, { status: res.status })
}
