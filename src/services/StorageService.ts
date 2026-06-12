import ApiService from '@/services/ApiService'
import axios from 'axios'

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

export async function apiUploadPrivateDocument(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
) {
    const response = await axios.put<{ object_name: string }>(uploadUrl, file, {
        headers: {
            'Content-Type': file.type,
        },
        onUploadProgress: (event) => {
            if (!event.total || !onProgress) return
            onProgress(Math.round((event.loaded / event.total) * 100))
        },
    })
    return response.data
}

export async function apiDownloadPrivateDocument(url: string) {
    const response = await axios.get<Blob>(url, { responseType: 'blob' })
    return response.data
}

const StorageApi = {
    apiGenerateUploadUrl,
    apiGenerateUpdateUrl,
    apiGenerateDeleteUrl,
    apiUploadPrivateDocument,
    apiDownloadPrivateDocument,
}

export default StorageApi
