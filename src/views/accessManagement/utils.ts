import type { AccessScopeParams } from '@/services/AccessManagementService'
import type { ScopeType } from './types'
import { getApiErrorMessage } from '@/utils/apiError'

export function getItems<T>(data: { items?: T[]; list?: T[] } | undefined): T[] {
    return data?.items || data?.list || []
}

export function getTotal<T>(data: { items?: T[]; list?: T[]; total?: number } | undefined): number {
    return Number(data?.total ?? getItems(data).length)
}

export function getErrorMessage(error: unknown, fallback: string) {
    return getApiErrorMessage(error, fallback)
}

export function buildScopeParams(scope: ScopeType, locationId: string, companyId: string) {
    const params: AccessScopeParams = {}

    const normalizedLocationId = Number(locationId)
    const normalizedCompanyId = Number(companyId)

    if (
        scope === 'location' &&
        Number.isInteger(normalizedLocationId) &&
        normalizedLocationId > 0
    ) {
        params.location_id = normalizedLocationId
    }

    if (Number.isInteger(normalizedCompanyId) && normalizedCompanyId > 0) {
        params.company_id = normalizedCompanyId
    }

    return params
}

export function isScopeReady(scope: ScopeType, locationId: string, companyId: string) {
    const params = buildScopeParams(scope, locationId, companyId)
    return scope === 'location' ? params.location_id !== undefined : params.company_id !== undefined
}
