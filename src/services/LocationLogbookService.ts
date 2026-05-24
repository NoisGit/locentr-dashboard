import ApiService from '@/services/ApiService'

export const LOCATION_LOGBOOK_BASE = '/api/v1/location-logbook'

export type LocationLogbookMediaType = 'PHOTO' | 'VIDEO'

export type LocationLogbookEntry = {
    id: number
    location_id: number
    created_by: number
    description: string
    media_url?: string | null
    media_type?: LocationLogbookMediaType | null
    created_at: string
    location_name?: string | null
    location_address?: string | null
    user_full_name?: string | null
}

export type LocationLogbookSettings = {
    location_id: number
    is_enabled: boolean
    updated_by?: number | null
    updated_at?: string | null
}

export type LocationLogbookCreateRequest = {
    location_id: number
    description: string
    media_name?: string | null
    media_type?: LocationLogbookMediaType | null
}

export type LocationLogbookSettingsUpdateRequest = {
    enabled: boolean
}

export type PoliceAccessCreateRequest = {
    location_id: number
}

export type PoliceLinkResponse = {
    relative_path: string
    expires_at: string
}

export type PaginatedResponse<T> = {
    items?: T[]
    total?: number
    page?: number
    size?: number
    pages?: number
}

export type ListLocationLogbookEntriesParams = {
    page?: number
    size?: number
}

function cleanLocationId(locationId: string | number) {
    return encodeURIComponent(String(locationId).replace(/\/+$/, ''))
}

export async function apiGetLocationLogbookSettings(
    locationId: string | number,
) {
    return ApiService.fetchDataWithAxios<LocationLogbookSettings>({
        url: `${LOCATION_LOGBOOK_BASE}/locations/${cleanLocationId(locationId)}/settings`,
        method: 'get',
    })
}

export async function apiUpdateLocationLogbookSettings(
    locationId: string | number,
    data: LocationLogbookSettingsUpdateRequest,
) {
    return ApiService.fetchDataWithAxios<
        LocationLogbookSettings,
        LocationLogbookSettingsUpdateRequest
    >({
        url: `${LOCATION_LOGBOOK_BASE}/locations/${cleanLocationId(locationId)}/settings`,
        method: 'put',
        data,
    })
}

export async function apiCreateLocationLogbookEntry(
    data: LocationLogbookCreateRequest,
) {
    return ApiService.fetchDataWithAxios<void, LocationLogbookCreateRequest>({
        url: `${LOCATION_LOGBOOK_BASE}/entries`,
        method: 'post',
        data,
    })
}

export async function apiListLocationLogbookEntries(
    locationId: string | number,
    params: ListLocationLogbookEntriesParams = {},
) {
    return ApiService.fetchDataWithAxios<PaginatedResponse<LocationLogbookEntry>>({
        url: `${LOCATION_LOGBOOK_BASE}/locations/${cleanLocationId(locationId)}/entries`,
        method: 'get',
        params: {
            page: params.page ?? 1,
            size: params.size ?? 10,
        },
    })
}

export async function apiCreatePoliceLogbookAccess(
    data: PoliceAccessCreateRequest,
) {
    return ApiService.fetchDataWithAxios<PoliceLinkResponse, PoliceAccessCreateRequest>({
        url: `${LOCATION_LOGBOOK_BASE}/police-access`,
        method: 'post',
        data,
    })
}

const LocationLogbookApi = {
    apiGetLocationLogbookSettings,
    apiUpdateLocationLogbookSettings,
    apiCreateLocationLogbookEntry,
    apiListLocationLogbookEntries,
    apiCreatePoliceLogbookAccess,
}

export default LocationLogbookApi
