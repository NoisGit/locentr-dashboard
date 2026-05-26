import type { AccessScopeParams } from '@/services/AccessManagementService'
import type { ScopeType } from './types'

export function getItems<T>(data: { items?: T[]; list?: T[] } | undefined): T[] {
    return data?.items || data?.list || []
}

export function getErrorMessage(error: unknown, fallback: string) {
    const requestError = error as {
        response?: { data?: { message?: string; detail?: string } }
        message?: string
    }

    return (
        requestError?.response?.data?.message ||
        requestError?.response?.data?.detail ||
        requestError?.message ||
        fallback
    )
}

export function buildScopeParams(
    scope: ScopeType,
    locationId: string,
    companyId: string,
) {
    const params: AccessScopeParams = {}

    if (scope === 'location' && locationId.trim()) {
        params.location_id = locationId.trim()
    }

    if (scope === 'company' && companyId.trim()) {
        params.company_id = companyId.trim()
    }

    return params
}
