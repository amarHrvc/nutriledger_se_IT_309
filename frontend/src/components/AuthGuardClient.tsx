'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode
}

const AuthGuardClient = ({ children }: Props) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only guard dashboard routes (everything except blank-layout auth pages).
    if (pathname?.startsWith('/login')) return

    const token = localStorage.getItem('token')

    if (!token) {
      router.replace('/login')
    }
  }, [pathname, router])

  return <>{children}</>
}

export default AuthGuardClient

