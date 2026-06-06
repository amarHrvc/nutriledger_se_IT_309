import { NextResponse } from 'next/server'

import { patientsVisitsIndex, patientsVisitsStore } from '@/api/generated/visit/visit'
import type { StoreVisitRequest } from '@/api/generated/nutriBaseAPI.schemas'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await patientsVisitsIndex(Number(id))
  return NextResponse.json(res.data, { status: res.status })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body: StoreVisitRequest = await req.json()
  const res = await patientsVisitsStore(Number(id), body)
  return NextResponse.json(res.data, { status: res.status })
}
