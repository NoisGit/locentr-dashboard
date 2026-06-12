export type Location = {
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

export type LocationsFilter = {
  query?: string
}

export type GetLocationsListResponse = {
  list: Location[]
  total: number
}
