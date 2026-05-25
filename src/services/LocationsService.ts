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

export type LocationPayload = {
  name: string
  address: string
  country?: string | null
  logo?: string | null
}

export type LocationAssignCompanyRequest = {
  company_id: number
}

export type LocationAssignUserRequest = {
  user_id: number
}

export type LocationOperator = {
  id: number
  username: string
  full_name: string
  email: string
  status: boolean
  created_at?: string | null
}

export type LocationAccessEntry = {
  id: number
  location_id: number
  id_number: string
  full_name: string
  type_access_list: string
  reason?: string | null
  vehicle_plate?: string | null
  expiration_date?: string | null
  created_at?: string | null
}

export type LocationCustomFieldRequest = {
  name: string
  field_type: string
  options?: string[] | null
  is_required?: boolean
  display_order?: number
  allow_image?: boolean
}

export type LocationCustomFieldUpdateRequest = Partial<LocationCustomFieldRequest>

export type LocationCustomFormUpsertRequest = {
  fields: LocationCustomFieldRequest[]
}

export type LocationCustomField = {
  id: number
  form_id: number
  name: string
  field_type: string
  options?: string[] | null
  is_required: boolean
  display_order: number
  allow_image: boolean
  is_active: boolean
  created_at: string
}

export type LocationCustomForm = {
  id: number
  location_id: number
  is_active: boolean
  created_by: number
  created_at: string
  updated_at?: string | null
  fields: LocationCustomField[]
}

export type PaginatedResponse<T> = {
  items?: T[]
  total?: number
  page?: number
  size?: number
  pages?: number
}

type LocationOperatorsParams = {
  page?: number
  size?: number
  search?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStr(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function cleanId(id: string | number) {
  return encodeURIComponent(String(id).replace(/\/+$/, ''))
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
  const total = Number(
    raw.total ??
      raw.count ??
      (isRecord(raw.data) ? raw.data.total ?? raw.data.count : undefined) ??
      items?.length ??
      0,
  )

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
  Q extends TableQueries = TableQueries,
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
  return ApiService.fetchDataWithAxios<void, LocationPayload>({
    url: LOCATIONS_BASE,
    method: 'post',
    data: payload,
  })
}

export async function apiGetLocationById(id: string | number) {
  const response = await ApiService.fetchDataWithAxios<unknown>({
    url: `${LOCATIONS_BASE}${cleanId(id)}`,
    method: 'get',
  })

  return mapLocationRow(response)
}

export async function apiUpdateLocation(
  id: string | number,
  payload: Partial<LocationPayload>,
) {
  return ApiService.fetchDataWithAxios<void, Partial<LocationPayload>>({
    url: `${LOCATIONS_BASE}${cleanId(id)}`,
    method: 'put',
    data: payload,
  })
}

export async function apiDeleteLocation(id: string | number) {
  return ApiService.fetchDataWithAxios<void>({
    url: `${LOCATIONS_BASE}${cleanId(id)}`,
    method: 'delete',
  })
}

export async function apiAssignCompanyToLocation(
  locationId: string | number,
  data: LocationAssignCompanyRequest,
) {
  return ApiService.fetchDataWithAxios<void, LocationAssignCompanyRequest>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/company`,
    method: 'post',
    data,
  })
}

export async function apiAssignUserToLocation(
  locationId: string | number,
  data: LocationAssignUserRequest,
) {
  return ApiService.fetchDataWithAxios<void, LocationAssignUserRequest>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/users`,
    method: 'post',
    data,
  })
}

export async function apiBulkImportOperators(locationId: string | number, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return ApiService.fetchDataWithAxios<void, FormData>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/bulk/operators`,
    method: 'post',
    data: formData,
  })
}

export async function apiGetLocationCustomForm(locationId: string | number) {
  return ApiService.fetchDataWithAxios<LocationCustomForm>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/custom-form`,
    method: 'get',
  })
}

export async function apiCreateLocationCustomFormFields(
  locationId: string | number,
  data: LocationCustomFormUpsertRequest,
) {
  return ApiService.fetchDataWithAxios<void, LocationCustomFormUpsertRequest>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/custom-form/fields`,
    method: 'post',
    data,
  })
}

export async function apiUpdateLocationCustomFormField(
  locationId: string | number,
  customFormFieldId: string | number,
  data: LocationCustomFieldUpdateRequest,
) {
  return ApiService.fetchDataWithAxios<void, LocationCustomFieldUpdateRequest>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/custom-form/fields/${cleanId(customFormFieldId)}`,
    method: 'put',
    data,
  })
}

export async function apiGetLocationAccessEntries(locationId: string | number) {
  return ApiService.fetchDataWithAxios<LocationAccessEntry[]>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/access_lists`,
    method: 'get',
  })
}

export async function apiListLocationOperators(
  locationId: string | number,
  params: LocationOperatorsParams = {},
) {
  return ApiService.fetchDataWithAxios<PaginatedResponse<LocationOperator>>({
    url: `${LOCATIONS_BASE}${cleanId(locationId)}/operators`,
    method: 'get',
    params: {
      page: params.page ?? 1,
      size: params.size ?? 10,
      search: params.search,
    },
  })
}

const LocationsApi = {
  apiGetLocationsList,
  apiCreateLocation,
  apiGetLocationById,
  apiUpdateLocation,
  apiDeleteLocation,
  apiAssignCompanyToLocation,
  apiAssignUserToLocation,
  apiBulkImportOperators,
  apiGetLocationCustomForm,
  apiCreateLocationCustomFormFields,
  apiUpdateLocationCustomFormField,
  apiGetLocationAccessEntries,
  apiListLocationOperators,
}

export default LocationsApi
