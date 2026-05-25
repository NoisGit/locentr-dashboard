import ApiService from '@/services/ApiService'

export const EMERGENCY_CONTACTS_BASE = '/api/v1/emergency-contacts'
export const SERVICE_CONTACTS_BASE = '/api/v1/service-contacts'

export type EmergencyContactCreateRequest = {
    name: string
    phone: string
    location_id?: number | null
    is_default?: boolean
}

export type EmergencyContactUpdateRequest = Partial<{
    name: string
    phone: string
    location_id: number | null
    is_default: boolean
}>

export type EmergencyContact = {
    id: number
    name: string
    phone: string
    location_id?: number | null
    is_default: boolean
    created_by: number
    created_at?: string | null
}

export type ServiceContactCreateRequest = {
    service_name: string
    person_name: string
    email: string
    phone: string
    location_id?: number | null
}

export type ServiceContactUpdateRequest = Partial<{
    service_name: string
    person_name: string
    email: string
    phone: string
}>

export type ServiceContact = {
    id: number
    location_id?: number | null
    service_name: string
    person_name: string
    email: string
    phone: string
    created_by: number
    created_at?: string | null
}

export type PaginatedResponse<T> = {
    items?: T[]
    total?: number
    page?: number
    size?: number
    pages?: number
}

export type ListLocationContactsParams = {
    location_id: number
    page?: number
    size?: number
}

function cleanId(id: string | number) {
    return encodeURIComponent(String(id).replace(/\/+$/, ''))
}

export async function apiListEmergencyContacts(
    params: ListLocationContactsParams,
) {
    return ApiService.fetchDataWithAxios<PaginatedResponse<EmergencyContact>>({
        url: EMERGENCY_CONTACTS_BASE,
        method: 'get',
        params: {
            location_id: params.location_id,
            page: params.page ?? 1,
            size: params.size ?? 10,
        },
    })
}

export async function apiGetEmergencyContactById(contactId: string | number) {
    return ApiService.fetchDataWithAxios<EmergencyContact>({
        url: `${EMERGENCY_CONTACTS_BASE}/${cleanId(contactId)}`,
        method: 'get',
    })
}

export async function apiCreateEmergencyContact(
    data: EmergencyContactCreateRequest,
) {
    return ApiService.fetchDataWithAxios<void, EmergencyContactCreateRequest>({
        url: EMERGENCY_CONTACTS_BASE,
        method: 'post',
        data,
    })
}

export async function apiUpdateEmergencyContact(
    contactId: string | number,
    data: EmergencyContactUpdateRequest,
) {
    return ApiService.fetchDataWithAxios<void, EmergencyContactUpdateRequest>({
        url: `${EMERGENCY_CONTACTS_BASE}/${cleanId(contactId)}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteEmergencyContact(contactId: string | number) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${EMERGENCY_CONTACTS_BASE}/${cleanId(contactId)}`,
        method: 'delete',
    })
}

export async function apiListServiceContacts(
    params: ListLocationContactsParams,
) {
    return ApiService.fetchDataWithAxios<PaginatedResponse<ServiceContact>>({
        url: SERVICE_CONTACTS_BASE,
        method: 'get',
        params: {
            location_id: params.location_id,
            page: params.page ?? 1,
            size: params.size ?? 10,
        },
    })
}

export async function apiCreateServiceContact(
    data: ServiceContactCreateRequest,
) {
    return ApiService.fetchDataWithAxios<void, ServiceContactCreateRequest>({
        url: SERVICE_CONTACTS_BASE,
        method: 'post',
        data,
    })
}

export async function apiBulkImportServiceContacts(
    locationId: string | number,
    file: File,
) {
    const formData = new FormData()
    formData.append('file', file)

    return ApiService.fetchDataWithAxios<void, FormData>({
        url: `${SERVICE_CONTACTS_BASE}/${cleanId(locationId)}/bulk`,
        method: 'post',
        data: formData,
    })
}

export async function apiUpdateServiceContact(
    contactId: string | number,
    data: ServiceContactUpdateRequest,
) {
    return ApiService.fetchDataWithAxios<void, ServiceContactUpdateRequest>({
        url: `${SERVICE_CONTACTS_BASE}/${cleanId(contactId)}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteServiceContact(contactId: string | number) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${SERVICE_CONTACTS_BASE}/${cleanId(contactId)}`,
        method: 'delete',
    })
}

const ContactsApi = {
    apiListEmergencyContacts,
    apiGetEmergencyContactById,
    apiCreateEmergencyContact,
    apiUpdateEmergencyContact,
    apiDeleteEmergencyContact,
    apiListServiceContacts,
    apiCreateServiceContact,
    apiBulkImportServiceContacts,
    apiUpdateServiceContact,
    apiDeleteServiceContact,
}

export default ContactsApi
