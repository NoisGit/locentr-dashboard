import ApiService from '@/services/ApiService'

export const SUBSCRIPTIONS_BASE = '/api/v1/subscriptions'

export type Plan = {
    code: string
    name: string
    description?: string | null
    monthly_price_cents: number
    qty_locations: number
    qty_admins: number
    qty_operators: number
    qty_daily_reads: number
    qty_storage_bytes: number
    checkout_available: boolean
}

export type SubscriptionUsage = {
    locations: number
    admins: number
    operators: number
    daily_reads: number
    storage_bytes: number
}

export type CompanySubscription = {
    company_id: number
    status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
    trial_started_at: string
    trial_ends_at: string
    current_period_end?: string | null
    plan: Plan
    usage: SubscriptionUsage
}

export type StartTrialRequest = {
    company: {
        name: string
        activity?: string | null
        id_number: string
        type_document: string
    }
    admin: {
        username: string
        full_name: string
        email: string
        password: string
    }
    location: {
        name: string
        address: string
        country?: string | null
    }
}

export type StartTrialResponse = {
    access_token: string
    refresh_token: string
    token_type: string
    company_id: number
    trial_ends_at: string
}

export async function apiListPlans() {
    return ApiService.fetchDataWithAxios<Plan[]>({
        url: `${SUBSCRIPTIONS_BASE}/plans`,
        method: 'get',
    })
}

export async function apiStartTrial(data: StartTrialRequest) {
    return ApiService.fetchDataWithAxios<StartTrialResponse, StartTrialRequest>({
        url: `${SUBSCRIPTIONS_BASE}/trial`,
        method: 'post',
        data,
    })
}

export async function apiGetSubscription(companyId?: string | number | null) {
    return ApiService.fetchDataWithAxios<CompanySubscription>({
        url: `${SUBSCRIPTIONS_BASE}/me`,
        method: 'get',
        params: {
            company_id: companyId || undefined,
        },
    })
}

export async function apiCreateCheckout(
    planCode: string,
    companyId?: string | number | null,
) {
    return ApiService.fetchDataWithAxios<{ url: string }>({
        url: `${SUBSCRIPTIONS_BASE}/checkout`,
        method: 'post',
        data: {
            plan_code: planCode,
            company_id: companyId || undefined,
        },
    })
}

export async function apiCreateBillingPortal(
    companyId?: string | number | null,
) {
    return ApiService.fetchDataWithAxios<{ url: string }>({
        url: `${SUBSCRIPTIONS_BASE}/portal`,
        method: 'post',
        data: {
            company_id: companyId || undefined,
        },
    })
}
