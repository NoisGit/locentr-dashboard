import appConfig from '@/configs/app.config'
import cookiesStorage from '@/utils/cookiesStorage'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import { useSessionUser } from '@/store/authStore'
import {
    useCompaniesStore,
    isVirtualCompanyId,
} from '@/store/companies/CompaniesStore'
import { RBAC } from '@/utils/rbac'
import { Role } from '@/utils/rbac/types'
import { createRequestId } from '@/services/TelemetryService'
import type { InternalAxiosRequestConfig } from 'axios'

const AUTH_PREFIX = '/api/v1/auth'
const COMPANIES_COLLECTION_PATHS = ['/api/v1/companies', '/api/v1/companies/']

function getPathname(raw?: string): string {
    if (!raw) return ''
    try {
        return new URL(raw, 'http://x').pathname.toLowerCase()
    } catch {
        return String(raw).toLowerCase()
    }
}

function shouldAttachCompany(pathname: string): boolean {
    if (!pathname) return false
    if (pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)) return false
    if (COMPANIES_COLLECTION_PATHS.includes(pathname)) return false
    return true
}

function getSelectedCompanyId(): string | number | undefined {
    try {
        const selectedId = useCompaniesStore.getState().selectedId
        if (
            selectedId !== undefined &&
            selectedId !== null &&
            String(selectedId) !== '' &&
            !isVirtualCompanyId(selectedId)
        ) {
            return selectedId
        }
    } catch {}

    try {
        const raw = localStorage.getItem('current_company')
        if (!raw) return undefined
        const parsed = JSON.parse(raw) as { id?: string | number }
        const id = parsed?.id
        if (
            id !== undefined &&
            id !== null &&
            String(id) !== '' &&
            !isVirtualCompanyId(id)
        ) {
            return id
        }
    } catch {}

    return undefined
}

function isSuperAdmin(): boolean {
    try {
        const user = useSessionUser.getState().user
        const role = RBAC.extractUserRole(user)
        return role === Role.SUPERADMIN
    } catch {
        return false
    }
}

export default function AxiosRequestIntrceptorConfigCallback<T = unknown>(
    config: InternalAxiosRequestConfig<T>,
) {
    config.headers = config.headers ?? {}
    if (!config.headers['x-request-id']) {
        config.headers['x-request-id'] = createRequestId()
    }

    const strategy = appConfig.accessTokenPersistStrategy

    let stored = ''
    try {
        if (strategy === 'localStorage') {
            stored = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
        } else if (strategy === 'sessionStorage') {
            stored = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
        } else {
            stored = cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
        }
    } catch {}

    if (stored) {
        const value = stored.trim()
        const hasBearer = /^bearer\s/i.test(value)
        const headerValue = hasBearer ? value : `${TOKEN_TYPE} ${value}`
        config.headers = config.headers ?? {}
        ;(config.headers as Record<string, unknown>)[REQUEST_HEADER_AUTH_KEY] =
            headerValue
    }

    const pathname = getPathname(typeof config.url === 'string' ? config.url : undefined)
    const method = String(config.method || 'get').toLowerCase()

    if (isSuperAdmin()) {
        return config
    }

    const companyId = getSelectedCompanyId()

    if (companyId !== undefined && shouldAttachCompany(pathname)) {
        config.headers = config.headers ?? {}
        ;(config.headers as Record<string, unknown>)['x-company-id'] = String(companyId)

        if (method === 'get' || method === 'delete') {
            if (!config.params || typeof config.params !== 'object') config.params = {}
            const params = config.params as Record<string, unknown>
            if (!('company_id' in params)) {
                params.company_id = companyId
            }
        }
    }

    return config
}
