const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const res = await fetch(`${BASE_URL}/api${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  const data = body ? JSON.parse(body) : {}

  return { data, status: res.status, headers: res.headers } as T
}
