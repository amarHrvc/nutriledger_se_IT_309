import { NextResponse } from 'next/server'

import { patientsVisitsShow, patientsVisitsUpdate, patientsVisitsDestroy } from '@/api/generated/visit/visit'
import type { UpdateVisitRequest } from '@/api/generated/nutriBaseAPI.schemas'

type RouteParams = { params: Promise<{ id: string; visitId: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { id, visitId } = await params
  const res = await patientsVisitsShow(Number(id), Number(visitId))
  return NextResponse.json(res.data, { status: res.status })
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id, visitId } = await params
  const body: UpdateVisitRequest = await req.json()
  const res = await patientsVisitsUpdate(Number(id), Number(visitId), body)
  return NextResponse.json(res.data, { status: res.status })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id, visitId } = await params
  const res = await patientsVisitsDestroy(Number(id), Number(visitId))
  return new Response(null, { status: res.status })
}
