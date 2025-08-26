import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  communityId?: number | string | ''
}

export type PropertyRow = {
  id: number | string
  communityId?: number | string
  communityName?: string
  propertyNumber?: string
  floor?: number
  tower?: string
  status?: string
  img?: string
}

export type GetPropertiesListResponse = {
  list: PropertyRow[]
  total: number
}

function pickArray(raw: any): any[] {
  return (
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw) && raw) ||
    []
  )
}

function mapRow(p: any): PropertyRow {
  return {
    id: String(p?.id ?? p?.property_id ?? '').replace(/\/+$/, ''),
    communityId: p?.community_id ?? p?.community?.id,
    communityName: p?.community_name ?? p?.community?.name,
    propertyNumber: p?.property_number ?? p?.number ?? p?.unit ?? p?.code,
    floor:
      typeof p?.floor === 'number'
        ? p.floor
        : Number.isFinite(Number(p?.floor))
        ? Number(p?.floor)
        : undefined,
    tower: p?.tower ?? p?.block ?? p?.building ?? undefined,
    status: p?.status ?? '',
    img: p?.img ?? p?.avatar ?? p?.avatar_url ?? '',
  }
}

export async function apiGetPropertiesList<
  T = GetPropertiesListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number((params as any).pageIndex ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number((params as any).pageSize ?? 10)))
  const skip = (pageIndex - 1) * pageSize
  const limit = pageSize

  const endpoint =
    (params as any).communityId
      ? `/api/v1/communities/${encodeURIComponent(String((params as any).communityId))}/properties`
      : '/api/v1/communities/properties'

  const body = await ApiService.fetchDataWithAxios<any>({
    url: endpoint,
    method: 'get',
    params: { skip, limit },
  })

  const items = pickArray(body)
  const total = Number(body?.total ?? items.length)
  const list: PropertyRow[] = items.map(mapRow)
  return { list, total } as T
}

export async function apiCreateProperty(payload: {
  community_id: number | string
  property_number: string
  floor: number | string
}) {
  const body: any = {
    community_id: Number(payload.community_id),
    property_number: String(payload.property_number ?? '').trim(),
    floor: Number(payload.floor),
  }
  return ApiService.fetchDataWithAxios({
    url: '/api/v1/communities/properties',
    method: 'post',
    data: body,
  })
}

export async function apiGetPropertyById(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const body = await ApiService.fetchDataWithAxios<any>({
    url: `/api/v1/communities/properties/id/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
  return mapRow(body)
}

export async function apiUpdateProperty(
  id: string | number,
  patch: Partial<{ community_id: number | string; property_number: string; floor: number | string }>
) {
  const cleanId = String(id).replace(/\/+$/, '')
  const data: any = {}
  if (patch.community_id !== undefined) data.community_id = Number(patch.community_id)
  if (patch.property_number !== undefined) data.property_number = String(patch.property_number ?? '').trim()
  if (patch.floor !== undefined) data.floor = Number(patch.floor)
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/communities/properties/id/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data,
  })
}

export async function apiDeleteProperty(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/communities/properties/id/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}

const PropertiesApi = {
  apiGetPropertiesList,
  apiCreateProperty,
  apiGetPropertyById,
  apiUpdateProperty,
  apiDeleteProperty,
}

export default PropertiesApi
