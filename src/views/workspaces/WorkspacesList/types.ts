export type Workspace = {
  id: number | string
  name: string
  address: string
  country?: string | null
  logo?: string | null
  companyIds?: number[]
  isActive?: boolean
  createdBy?: number
  createdAt?: string | null
}

export type WorkspacesFilter = {
  query?: string
}

export type GetWorkspacesListResponse = {
  list: Workspace[]
  total: number
}
