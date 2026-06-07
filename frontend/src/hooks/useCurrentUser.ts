'use client'

import { useEffect, useState } from 'react'

import type { UserResource } from '@/api/generated/nutriBaseAPI.schemas'

type UserRole = 'admin' | 'doktor' | 'pacijent'

export function useCurrentUser() {
  const [user, setUser] = useState<UserResource | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as UserResource)
      } catch {
        setUser(null)
      }
    }
    setReady(true)
  }, [])

  const role = (user?.attributes?.role ?? null) as UserRole | null

  return {
    user,
    role,
    ready,
    isStaff: role === 'admin' || role === 'doktor',
    isPatient: role === 'pacijent',
    isAdmin: role === 'admin'
  }
}
