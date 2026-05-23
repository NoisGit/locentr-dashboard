import ApiService from './ApiService'

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'canceled'

export type SupportTicket = {
    id: number | string
    subject?: string
    title?: string
    description?: string
    message?: string
    status?: SupportTicketStatus | string
    priority?: string
    created_at?: string
    updated_at?: string
}

export type SupportTicketsListResponse = {
    items?: SupportTicket[]
    list?: SupportTicket[]
    total?: number
}

export type SupportTicketsListParams = {
    page?: number
    size?: number
    status?: string
}

export type SupportTicketCreateRequest = {
    subject: string
    description: string
    priority?: string
}

export type SupportTicketUpdateRequest = Partial<SupportTicketCreateRequest> & {
    status?: string
}

export async function apiGetAllSupportTickets(params?: SupportTicketsListParams) {
    return ApiService.fetchDataWithAxios<SupportTicketsListResponse>({
        url: '/api/v1/support-tickets/all',
        method: 'get',
        params,
    })
}

export async function apiGetMySupportTickets(params?: SupportTicketsListParams) {
    return ApiService.fetchDataWithAxios<SupportTicketsListResponse>({
        url: '/api/v1/support-tickets/me',
        method: 'get',
        params,
    })
}

export async function apiGetSupportTicketById(ticketId: string | number) {
    return ApiService.fetchDataWithAxios<SupportTicket>({
        url: `/api/v1/support-tickets/${ticketId}`,
        method: 'get',
    })
}

export async function apiCreateSupportTicket(data: SupportTicketCreateRequest) {
    return ApiService.fetchDataWithAxios<SupportTicket, SupportTicketCreateRequest>({
        url: '/api/v1/support-tickets/',
        method: 'post',
        data,
    })
}

export async function apiUpdateSupportTicket(
    ticketId: string | number,
    data: SupportTicketUpdateRequest,
) {
    return ApiService.fetchDataWithAxios<SupportTicket, SupportTicketUpdateRequest>({
        url: `/api/v1/support-tickets/${ticketId}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteSupportTicket(ticketId: string | number) {
    return ApiService.fetchDataWithAxios<void>({
        url: `/api/v1/support-tickets/${ticketId}`,
        method: 'delete',
    })
}
