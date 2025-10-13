export type StatusApi = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
export type PriorityApi = 'LOW' | 'MEDIUM' | 'HIGH'

export type IncidentRow = {
  id: string | number
  title: string
  status: StatusApi
  priority?: PriorityApi | string
  property_code?: string | number
  created_at?: string
  community_id?: string | number
  community_name?: string
}

export type GetIncidentsListResponse = {
  list: IncidentRow[]
  total: number
}

export type SortParam = {
  key: string
  order: 'asc' | 'desc'
}

export type TableQueries = {
  pageIndex?: number
  pageSize?: number
  query?: string
  sort?: SortParam
}
