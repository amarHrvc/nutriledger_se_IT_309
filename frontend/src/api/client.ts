type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  status: number
  statusText: string
  payload?: ApiErrorPayload

  constructor(args: { status: number; statusText: string; message: string; payload?: ApiErrorPayload }) {
    super(args.message)
    this.name = 'ApiError'
    this.status = args.status
    this.statusText = args.statusText
    this.payload = args.payload
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  if (!BASE_URL) {
    throw new ApiError({
      status: 0,
      statusText: 'MissingConfig',
      message: 'Missing NEXT_PUBLIC_API_URL. Set your frontend env so the app can reach the backend.'
    })
  }

  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type') ?? ''
    const raw = await response.text()
    const maybeJson = contentType.includes('application/json')

    const data = maybeJson && raw ? (JSON.parse(raw) as unknown) : (raw as unknown)

    if (!response.ok) {
      const payload = (maybeJson ? (data as ApiErrorPayload) : undefined) ?? undefined
      const serverMessage =
        payload?.message ||
        (typeof data === 'string' && data.trim().length ? data : null) ||
        `${response.status} ${response.statusText}`

      // Handle 401 Unauthorized - token expired or invalid
      // BUT: Don't redirect if this is the login endpoint itself (failed login attempt)
      if (response.status === 401 && typeof window !== 'undefined' && !path.includes('login')) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }

      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        message: serverMessage,
        payload
      })
    }

    return data as T
  } catch (err) {
    // If it's already an ApiError, re-throw it
    if (err instanceof ApiError) {
      throw err
    }

    // Handle network errors (fetch failures)
    if (err instanceof TypeError) {
      throw new ApiError({
        status: 0,
        statusText: 'NetworkError',
        message: 'Network error: Unable to reach the server. Please check your connection.'
      })
    }

    // Handle other unexpected errors
    throw new ApiError({
      status: 0,
      statusText: 'UnknownError',
      message: err instanceof Error ? err.message : 'An unexpected error occurred'
    })
  }
}

export const  client = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE'})
}
