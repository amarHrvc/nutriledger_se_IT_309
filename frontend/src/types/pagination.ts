export type PaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number | null
  to?: number | null
}

export type PaginatedResponse<T> = {
  message: string
  status: number
  data: T[]
  meta?: PaginationMeta
  links?: Record<string, string | null>
}

export const DEFAULT_PAGE_SIZE = 10

export function buildPageQuery(page: number, perPage = DEFAULT_PAGE_SIZE) {
  return `page=${page}&per_page=${perPage}`
}

export function clientPaginationMeta(total: number, page: number, perPage: number): PaginationMeta {
  const last_page = Math.max(1, Math.ceil(total / perPage))

  return {
    current_page: page,
    last_page,
    per_page: perPage,
    total,
    from: total === 0 ? null : (page - 1) * perPage + 1,
    to: total === 0 ? null : Math.min(page * perPage, total)
  }
}
