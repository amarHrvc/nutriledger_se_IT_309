export type AuthUser = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export function toAuthUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: raw.id as number,
    name: raw.name as string,
    email: raw.email as string,
    email_verified_at: (raw.email_verified_at as string) ?? null,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  }
}
