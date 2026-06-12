import ApiService from '@/services/ApiService'

const LIFECYCLE_BASE = '/api/v1/lifecycle'

export type CommunicationPreference = {
    company_id: number
    billing_emails: boolean
    product_emails: boolean
    updated_at: string
}

export type BillingInvoice = {
    id: number
    status: string
    currency: string
    amount_due: number
    amount_paid: number
    hosted_invoice_url?: string | null
    invoice_pdf?: string | null
    period_start?: string | null
    period_end?: string | null
    created_at: string
}

export async function apiGetCommunicationPreferences(companyId?: string | number | null) {
    return ApiService.fetchDataWithAxios<CommunicationPreference>({
        url: `${LIFECYCLE_BASE}/preferences`,
        method: 'get',
        params: { company_id: companyId || undefined },
    })
}

export async function apiUpdateCommunicationPreferences(
    preferences: Pick<CommunicationPreference, 'billing_emails' | 'product_emails'>,
    companyId?: string | number | null,
) {
    return ApiService.fetchDataWithAxios<CommunicationPreference>({
        url: `${LIFECYCLE_BASE}/preferences`,
        method: 'put',
        data: {
            ...preferences,
            company_id: companyId || undefined,
        },
    })
}

export async function apiListInvoices(companyId?: string | number | null) {
    return ApiService.fetchDataWithAxios<BillingInvoice[]>({
        url: `${LIFECYCLE_BASE}/invoices`,
        method: 'get',
        params: { company_id: companyId || undefined },
    })
}

export async function apiVerifyEmail(token: string) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${LIFECYCLE_BASE}/verify-email`,
        method: 'post',
        data: { token },
    })
}
