export type Property = {
  id: string | number
  communityId?: number | string
  communityName?: string
  propertyNumber?: string
  floor?: number
  tower?: string
  status?: string
  img?: string
}

export type GetPropertiesListResponse = {
  list: Property[]
  total: number
}

export type Filter = {
  communityId?: number | string | ''
}
