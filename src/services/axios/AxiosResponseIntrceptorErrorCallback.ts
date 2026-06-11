import { useSessionUser, useToken } from '@/store/authStore'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { captureEvent } from '@/services/TelemetryService'
import endpointConfig from '@/configs/endpoint.config'
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

const UNAUTHORIZED_CODES = [401, 419, 440]
const FORBIDDEN_CODES = [403]

let isRedirecting = false
let refreshPromise: Promise<string> | null = null

type RetriableRequestConfig = AxiosRequestConfig & {
    _retry?: boolean
    _skipAuthRefresh?: boolean
}

function onAuthPath(pathname: string) {
    return pathname.startsWith('/auth')
}

function getPathname(raw?: string) {
    try {
        return new URL(raw ?? '', window.location.origin).pathname
    } catch {
        return window.location.pathname
    }
}

function headerHasCompanyId(headers?: unknown): boolean {
    if (!headers || typeof headers !== 'object') return false

    return Object.keys(headers as Record<string, unknown>).some(
        (key) => key.toLowerCase() === 'x-company-id',
    )
}

function getSafeRedirectTarget(pathname: string) {
    if (!pathname || onAuthPath(pathname) || pathname.startsWith('//')) {
        return appConfig.authenticatedEntryPath
    }

    return `${pathname}${window.location.search}`
}

const emptyUser = {
    avatar: '',
    userName: '',
    email: '',
    role: null,
    permissions: [],
}

function withBearerPrefix(token: string, tokenType?: string) {
    if (/^bearer\s+/i.test(token)) return token
    return `${tokenType || 'Bearer'} ${token}`.trim()
}

async function refreshAccessToken(client: AxiosInstance) {
    const { refreshToken, setToken } = useToken()
    if (!refreshToken) throw new Error('No refresh token available.')

    if (!refreshPromise) {
        refreshPromise = client
            .post<{
                access_token: string
                token_type?: string
            }>(endpointConfig.refreshAccessToken, { refresh_token: refreshToken }, {
                _skipAuthRefresh: true,
            } as RetriableRequestConfig)
            .then(({ data }) => {
                const token = withBearerPrefix(data.access_token, data.token_type)
                setToken(token)
                return token
            })
            .finally(() => {
                refreshPromise = null
            })
    }

    return refreshPromise
}

const AxiosResponseIntrceptorErrorCallback = async (error: AxiosError, client: AxiosInstance) => {
    const status = error.response?.status
    const pathname = getPathname(error.config?.url)
    const requestId = error.config?.headers?.['x-request-id']
    const requestConfig = error.config as RetriableRequestConfig | undefined

    if (status === 401 && requestConfig?._skipAuthRefresh) {
        return Promise.reject(error)
    }

    if (!status || status === 429 || status >= 500) {
        captureEvent(
            'api.request_failed',
            {
                method: error.config?.method?.toUpperCase(),
                endpoint: pathname,
                requestId: typeof requestId === 'string' ? requestId : undefined,
                status: status ?? 0,
            },
            'error',
        )
    }

    if (status === 401 && requestConfig && !requestConfig._retry && !onAuthPath(pathname)) {
        requestConfig._retry = true
        try {
            const token = await refreshAccessToken(client)
            requestConfig.headers = {
                ...requestConfig.headers,
                Authorization: token,
            }
            return client(requestConfig)
        } catch {}
    }

    if (status && UNAUTHORIZED_CODES.includes(status)) {
        try {
            const { clearToken } = useToken()
            clearToken?.()
        } catch {}

        try {
            useSessionUser.getState().resetAuth()
        } catch {
            try {
                useSessionUser.getState().setUser(emptyUser)
                useSessionUser.getState().setSessionSignedIn(false)
            } catch {}
        }

        try {
            useCompaniesStore.getState().clearCompany()
        } catch {}

        let isLoggingOut = false
        try {
            isLoggingOut = sessionStorage.getItem('__isLoggingOut') === 'true'
        } catch {}

        if (!onAuthPath(pathname) && !isRedirecting && !isLoggingOut) {
            isRedirecting = true
            const redirect = encodeURIComponent(getSafeRedirectTarget(pathname))
            const dest = `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${redirect}`
            window.location.replace(dest)
        }
    }

    if (status && FORBIDDEN_CODES.includes(status)) {
        const hadCompanyHeader = headerHasCompanyId(error.config?.headers)

        if (hadCompanyHeader) {
            try {
                useCompaniesStore.getState().clearCompany()
            } catch {}
        }
    }

    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
