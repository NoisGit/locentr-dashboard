import ApiService from '@/services/ApiService'

export const STORAGE_BASE = '/api/v1/storage'

export type StorageUploadRequest = {
    container_name: string
    file_extension: string
    content_type: string
}

export type StorageUpdateRequest = {
    old_object_url: string
    file_extension: string
    content_type: string
}

export type StorageDeleteRequest = {
    object_url: string
}

export type StorageUploadResponse = {
    object_url: string
    object_name: string
}

export type StorageUpdateResponse = {
    delete_url: string
    new_object_name: string
    new_object_url: string
}

export type StorageDeleteResponse = {
    object_url: string
}

export async function apiGenerateUploadUrl(data: StorageUploadRequest) {
    return ApiService.fetchDataWithAxios<StorageUploadResponse, StorageUploadRequest>({
        url: `${STORAGE_BASE}/generate_upload_url`,
        method: 'post',
        data,
    })
}

export async function apiGenerateUpdateUrl(data: StorageUpdateRequest) {
    return ApiService.fetchDataWithAxios<StorageUpdateResponse, StorageUpdateRequest>({
        url: `${STORAGE_BASE}/generate_update_url`,
        method: 'post',
        data,
    })
}

export async function apiGenerateDeleteUrl(data: StorageDeleteRequest) {
    return ApiService.fetchDataWithAxios<StorageDeleteResponse, StorageDeleteRequest>({
        url: `${STORAGE_BASE}/generate_delete_url`,
        method: 'post',
        data,
    })
}

const StorageApi = {
    apiGenerateUploadUrl,
    apiGenerateUpdateUrl,
    apiGenerateDeleteUrl,
}

export default StorageApi
