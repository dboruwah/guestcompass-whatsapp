export interface ApiResponse<T = unknown> {
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  code: string
  message: string
  details: string | null
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface SearchParams extends PaginationParams {
  query?: string
  filters?: Record<string, string | string[] | undefined>
}

export type SortDirection = "asc" | "desc"

export interface SortConfig {
  key: string
  direction: SortDirection
}
