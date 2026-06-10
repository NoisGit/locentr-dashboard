import type { AccessScopeParams } from '@/services/AccessManagementService'
import type { ScopeType } from './types'
import { getApiErrorMessage } from '@/utils/apiError'

export function getItems<T>(
    data: { items?: T[]; list?: T[] } | undefined,
): T[] {
    return data?.items || data?.list || []
}

export function getErrorMessage(error: unknown, fallback: string) {
    return getApiErrorMessage(error, fallback)
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
