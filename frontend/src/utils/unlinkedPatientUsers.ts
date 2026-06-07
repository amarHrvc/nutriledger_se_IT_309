import { client } from '@/api/client'
import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'
import { buildPageQuery, type PaginatedResponse } from '@/types/pagination'

export type PatientUserOption = {
  id: number
  name: string
  email: string
}

type PatientListItem = {
  relationships?: {
    user?: {
      data?: { id?: string | number }
    }
  }
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = []
  let page = 1
  let lastPage = 1

  do {
    const res = await client.get<PaginatedResponse<T>>(`${path}${path.includes('?') ? '&' : '?'}${buildPageQuery(page, 50)}`)
    items.push(...res.data)
    lastPage = res.meta?.last_page ?? 1
    page++
  } while (page <= lastPage)

  return items
}

export async function fetchUnlinkedPatientUsers(): Promise<PatientUserOption[]> {
  const patients = await fetchAllPages<PatientListItem>('api/patients')
  const linkedUserIds = new Set<number>()

  for (const patient of patients) {
    const userId = patient.relationships?.user?.data?.id
    if (userId != null) {
      linkedUserIds.add(Number(userId))
    }
  }

  const users = await fetchAllPages<UserResource>('api/users')

  return users
    .filter(
      user =>
        user.attributes.role === 'pacijent' &&
        !user.attributes.deletedAt &&
        !linkedUserIds.has(user.id)
    )
    .map(user => ({
      id: user.id,
      name: user.attributes.name,
      email: user.attributes.email
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
