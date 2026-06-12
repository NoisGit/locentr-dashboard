import ApiService from '@/services/ApiService'

const TEAMS_BASE = '/api/v1/teams'

export type InvitationRole = 'ADMIN' | 'OPERATOR' | 'CLIENT'
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'

export type TenantInvitation = {
    id: number
    company_id: number
    location_id?: number | null
    email: string
    full_name: string
    username: string
    role: InvitationRole
    status: InvitationStatus
    expires_at: string
    created_at: string
}

export type CreatedInvitation = TenantInvitation & {
    invitation_url: string
}

export type SeatUsage = {
    admins_used: number
    admins_limit: number
    operators_used: number
    operators_limit: number
    pending_admins: number
    pending_operators: number
}

export type CreateInvitationRequest = {
    company_id?: number
    location_id?: number
    email: string
    full_name: string
    username: string
    role: InvitationRole
}

export async function apiListInvitations(companyId?: string | number | null) {
    return ApiService.fetchDataWithAxios<TenantInvitation[]>({
        url: `${TEAMS_BASE}/invitations`,
        method: 'get',
        params: { company_id: companyId || undefined },
    })
}

export async function apiGetSeatUsage(companyId?: string | number | null) {
    return ApiService.fetchDataWithAxios<SeatUsage>({
        url: `${TEAMS_BASE}/seats`,
        method: 'get',
        params: { company_id: companyId || undefined },
    })
}

export async function apiCreateInvitation(data: CreateInvitationRequest) {
    return ApiService.fetchDataWithAxios<CreatedInvitation, CreateInvitationRequest>({
        url: `${TEAMS_BASE}/invitations`,
        method: 'post',
        data,
    })
}

export async function apiResendInvitation(invitationId: number) {
    return ApiService.fetchDataWithAxios<CreatedInvitation>({
        url: `${TEAMS_BASE}/invitations/${invitationId}/resend`,
        method: 'post',
    })
}

export async function apiRevokeInvitation(invitationId: number) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${TEAMS_BASE}/invitations/${invitationId}`,
        method: 'delete',
    })
}

export async function apiAcceptInvitation(token: string, password: string) {
    return ApiService.fetchDataWithAxios<{
        access_token: string
        refresh_token: string
        token_type: string
        company_id: number
    }>({
        url: `${TEAMS_BASE}/invitations/accept`,
        method: 'post',
        data: { token, password },
    })
}
