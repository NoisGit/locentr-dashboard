import ApiService from '@/services/ApiService'

export const LOCATIONS_BASE = '/api/v1/locations/'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  companyId?: number | string | ''
}

export type LocationRow = {
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

export type GetLocationsListResponse = {
  list: LocationRow[]
  total: number
}

type LocationPayload = {
  name: string
  address: string
  country?: string | null
  logo?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStr(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  if (Array.isArray(raw)) return { items: raw, total: raw.length }

  if (!isRecord(raw)) return { items: [], total: 0 }

  const candidates = [
    raw.items,
    isRecord(raw.data) ? raw.data.items : undefined,
    raw.list,
    isRecord(raw.data) ? raw.data.list : undefined,
    raw.results,
    isRecord(raw.data) ? raw.data.results : undefined,
    raw.data,
  ]

  const items = candidates.find(Array.isArray) as unknown[] | undefined
  const total =
    Number(raw.total ?? raw.count ?? (isRecord(raw.data) ? raw.data.total ?? raw.data.count : undefined) ?? items?.length ?? 0)

  return { items: items ?? [], total }
}

function mapLocationRow(value: unknown): LocationRow {
  const item = isRecord(value) ? value : {}
  const rawId = item.id ?? item.location_id ?? item.locationId ?? ''
  const companyIds = Array.isArray(item.company_ids)
    ? item.company_ids.map(Number).filter(Number.isFinite)
    : []

  return {
    id: rawId as string | number,
    name: toStr(item.name),
    address: toStr(item.address),
    country: toStr(item.country) || null,
    logo: toStr(item.logo) || null,
    companyIds,
    isActive: typeof item.is_active === 'boolean' ? item.is_active : undefined,
    createdBy: typeof item.created_by === 'number' ? item.created_by : undefined,
    createdAt: toStr(item.created_at) || null,
  }
}

export async function apiGetLocationsList<
  T = GetLocationsListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(params.pageSize ?? 10))

  const queryParams: Record<string, unknown> = {
    page: pageIndex,
    size: pageSize,
  }

  if (params.query) queryParams.search = params.query
  if (params.companyId !== undefined && params.companyId !== '') {
    queryParams.company_id = Number(params.companyId)
  }

  const response = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: LOCATIONS_BASE,
    method: 'get',
    params: queryParams,
  })

  const { items, total } = pickItemsAndTotal(response)
  const list = items.map(mapLocationRow)

  return { list, total } as T
}

export async function apiCreateLocation(payload: LocationPayload) {
  return ApiService.fetchDataWithAxios<unknown, LocationPayload>({
    url: LOCATIONS_BASE,
    method: 'post',
    data: payload,
  })
}

export async function apiGetLocationById(id: string | number) {
  const response = await ApiService.fetchDataWithAxios<unknown>({
    url: `${LOCATIONS_BASE}${encodeURIComponent(String(id))}`,
    method: 'get',
  })

  return mapLocationRow(response)
}

export async function apiUpdateLocation(id: string | number, payload: Partial<LocationPayload>) {
  return ApiService.fetchDataWithAxios<unknown, Partial<LocationPayload>>({
    url: `${LOCATIONS_BASE}${encodeURIComponent(String(id))}`,
    method: 'put',
    data: payload,
  })
}

export async function apiDeleteLocation(id: string | number) {
  return ApiService.fetchDataWithAxios<unknown>({
    url: `${LOCATIONS_BASE}${encodeURIComponent(String(id))}`,
    method: 'delete',
  })
}

const LocationsApi = {
  apiGetLocationsList,
  apiCreateLocation,
  apiGetLocationById,
  apiUpdateLocation,
  apiDeleteLocation,
}

export default LocationsApi
