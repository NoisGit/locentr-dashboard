import ApiService from '@/services/ApiService'

export const DOCUMENTS_BASE = '/api/v1/documents'

export type DocumentCreateRequest = {
    company_id: number
    name: string
    file_name: string
    blob_name: string
    content_type?: string | null
    size_bytes?: number | null
    comment?: string | null
}

export type DocumentUpdateRequest = Partial<{
    name: string
    comment: string | null
    file_name: string
    blob_name: string
    content_type: string | null
    size_bytes: number | null
}>

export type DocumentResponse = {
    id: number
    company_id: number
    user_id: number
    name: string
    file_name: string
    blob_name: string
    url?: string | null
    comment?: string | null
    content_type?: string | null
    size_bytes?: number | null
    created_by: number
    created_at: string
}

export type DocumentDownloadResponse = {
    url: string
}

export type PaginatedResponse<T> = {
    items?: T[]
    total?: number
    page?: number
    size?: number
    pages?: number
}

export type ListDocumentsParams = {
    page?: number
    size?: number
    company_id?: number
    search?: string
}

function cleanId(id: string | number) {
    return encodeURIComponent(String(id).replace(/\/+$/, ''))
}

export async function apiListAllDocuments(params: ListDocumentsParams = {}) {
    return ApiService.fetchDataWithAxios<PaginatedResponse<DocumentResponse>>({
        url: `${DOCUMENTS_BASE}/all`,
        method: 'get',
        params: {
            page: params.page ?? 1,
            size: params.size ?? 10,
            company_id: params.company_id,
            search: params.search,
        },
    })
}

export async function apiListMyCompanyDocuments(params: ListDocumentsParams = {}) {
    return ApiService.fetchDataWithAxios<PaginatedResponse<DocumentResponse>>({
        url: `${DOCUMENTS_BASE}/me`,
        method: 'get',
        params: {
            page: params.page ?? 1,
            size: params.size ?? 10,
            search: params.search,
        },
    })
}

export async function apiGetDocumentById(documentId: string | number) {
    return ApiService.fetchDataWithAxios<DocumentResponse>({
        url: `${DOCUMENTS_BASE}/${cleanId(documentId)}`,
        method: 'get',
    })
}

export async function apiGetDocumentDownloadUrl(documentId: string | number) {
    return ApiService.fetchDataWithAxios<DocumentDownloadResponse>({
        url: `${DOCUMENTS_BASE}/${cleanId(documentId)}/download`,
        method: 'get',
    })
}

export async function apiCreateDocument(data: DocumentCreateRequest) {
    return ApiService.fetchDataWithAxios<void, DocumentCreateRequest>({
        url: DOCUMENTS_BASE,
        method: 'post',
        data,
    })
}

export async function apiUpdateDocument(
    documentId: string | number,
    data: DocumentUpdateRequest,
) {
    return ApiService.fetchDataWithAxios<void, DocumentUpdateRequest>({
        url: `${DOCUMENTS_BASE}/${cleanId(documentId)}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteDocument(documentId: string | number) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${DOCUMENTS_BASE}/${cleanId(documentId)}`,
        method: 'delete',
    })
}

const DocumentsApi = {
    apiListAllDocuments,
    apiListMyCompanyDocuments,
    apiGetDocumentById,
    apiGetDocumentDownloadUrl,
    apiCreateDocument,
    apiUpdateDocument,
    apiDeleteDocument,
}

export default DocumentsApi
