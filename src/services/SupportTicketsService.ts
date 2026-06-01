import ApiService from './ApiService'

export const SUPPORT_TICKETS_BASE = '/api/v1/support-tickets'

export type SupportTicketStatus =
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'CLOSED'
    | 'CANCELED'

export type SupportTicket = {
    id: number | string
    title: string
    description: string
    media_name?: string | null
    status: SupportTicketStatus
    created_by?: number
    created_at?: string
}

export type SupportTicketsListResponse = {
    items?: SupportTicket[]
    list?: SupportTicket[]
    total?: number
    page?: number
    size?: number
    pages?: number
}

export type SupportTicketsListParams = {
    page?: number
    size?: number
    status?: SupportTicketStatus
}

export type SupportTicketCreateRequest = {
    title: string
    description: string
    media_name?: string | null
}

export type SupportTicketUpdateRequest = Partial<SupportTicketCreateRequest> & {
    status?: SupportTicketStatus
}

export type SupportTicketComment = {
    id: number
    ticket_id: number
    content: string
    created_by: number
    created_at: string
    edited_at?: string | null
}

export type SupportTicketCommentCreateRequest = {
    content: string
}

export type SupportTicketCommentUpdateRequest = Partial<SupportTicketCommentCreateRequest>

function cleanId(value: string | number) {
    return encodeURIComponent(String(value).replace(/\/+$/, ''))
}

function ticketUrl(ticketId: string | number) {
    return `${SUPPORT_TICKETS_BASE}/${cleanId(ticketId)}`
}

function commentUrl(ticketId: string | number, commentId: string | number) {
    return `${ticketUrl(ticketId)}/comments/${cleanId(commentId)}`
}

export async function apiGetAllSupportTickets(params?: SupportTicketsListParams) {
    return ApiService.fetchDataWithAxios<SupportTicketsListResponse>({
        url: `${SUPPORT_TICKETS_BASE}/all`,
        method: 'get',
        params,
    })
}

export async function apiGetMySupportTickets(params?: SupportTicketsListParams) {
    return ApiService.fetchDataWithAxios<SupportTicketsListResponse>({
        url: `${SUPPORT_TICKETS_BASE}/me`,
        method: 'get',
        params,
    })
}

export async function apiGetSupportTicketById(ticketId: string | number) {
    return ApiService.fetchDataWithAxios<SupportTicket>({
        url: ticketUrl(ticketId),
        method: 'get',
    })
}

export async function apiCreateSupportTicket(data: SupportTicketCreateRequest) {
    return ApiService.fetchDataWithAxios<SupportTicket, SupportTicketCreateRequest>({
        url: `${SUPPORT_TICKETS_BASE}/`,
        method: 'post',
        data,
    })
}

export async function apiUpdateSupportTicket(
    ticketId: string | number,
    data: SupportTicketUpdateRequest,
) {
    return ApiService.fetchDataWithAxios<SupportTicket, SupportTicketUpdateRequest>({
        url: ticketUrl(ticketId),
        method: 'put',
        data,
    })
}

export async function apiDeleteSupportTicket(ticketId: string | number) {
    return ApiService.fetchDataWithAxios<void>({
        url: ticketUrl(ticketId),
        method: 'delete',
    })
}

export async function apiListSupportTicketComments(ticketId: string | number) {
    return ApiService.fetchDataWithAxios<SupportTicketComment[]>({
        url: `${ticketUrl(ticketId)}/comments`,
        method: 'get',
    })
}

export async function apiGetSupportTicketCommentById(
    ticketId: string | number,
    commentId: string | number,
) {
    return ApiService.fetchDataWithAxios<SupportTicketComment>({
        url: commentUrl(ticketId, commentId),
        method: 'get',
    })
}

export async function apiCreateSupportTicketComment(
    ticketId: string | number,
    data: SupportTicketCommentCreateRequest,
) {
    return ApiService.fetchDataWithAxios<
        SupportTicketComment,
        SupportTicketCommentCreateRequest
    >({
        url: `${ticketUrl(ticketId)}/comments`,
        method: 'post',
        data,
    })
}

export async function apiUpdateSupportTicketComment(
    ticketId: string | number,
    commentId: string | number,
    data: SupportTicketCommentUpdateRequest,
) {
    return ApiService.fetchDataWithAxios<
        SupportTicketComment,
        SupportTicketCommentUpdateRequest
    >({
        url: commentUrl(ticketId, commentId),
        method: 'put',
        data,
    })
}

export async function apiDeleteSupportTicketComment(
    ticketId: string | number,
    commentId: string | number,
) {
    return ApiService.fetchDataWithAxios<void>({
        url: commentUrl(ticketId, commentId),
        method: 'delete',
    })
}
