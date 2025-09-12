// src/services/ApiService.ts
import AxiosBase from './axios/AxiosBase'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

function normalizeUsersUrl(rawUrl: string) {
    try {
        const u = new URL(rawUrl, 'http://x')
        const path = u.pathname
        const q = u.search || ''
        const h = u.hash || ''
        if (/^\/api\/v1\/users\/me\/$/i.test(path)) return '/api/v1/users/me' + q + h
        if (/^\/api\/v1\/users\/[^/]+\/$/i.test(path)) {
            const trimmed = path.replace(/\/+$/, '')
            return trimmed + q + h
        }
    } catch { /* noop */ }
    return rawUrl
}

function stripTrailingSlash(p: string) {
    return p.replace(/\/+$/, '')
}

function getPathname(rawUrl: string): string {
    try {
        return new URL(rawUrl, 'http://x').pathname
    } catch {
        // si es relativo, intenta tomar sólo la parte antes del query/hash
        return String(rawUrl).split('?')[0].split('#')[0]
    }
}

/**
 * Endpoints que NO deben recibir contexto de comunidad
 * - Comunidades (global): listado/detalle/etc.
 * - Access (mis comunidades)
 * - Auth (login/refresh/otp/etc.)
 */
function shouldSkipCommunityContext(pathname: string): boolean {
    const p = stripTrailingSlash(pathname.toLowerCase())
    if (p.startsWith('/api/v1/communities')) return true
    if (p === '/api/v1/communities/access') return true
    if (p.startsWith('/api/v1/auth')) return true
    return false
}

function withCommunityContext<Request = Record<string, unknown>>(
    cfg: AxiosRequestConfig<Request>,
): AxiosRequestConfig<Request> {
    const url = String(cfg.url ?? '')
    const pathname = getPathname(url)

    // No inyectar para endpoints excluidos
    if (shouldSkipCommunityContext(pathname)) {
        return cfg
    }

    // Leer comunidad actual del store (no rompe SSR; zustand permite getState())
    let communityId: string | number | null = null
    try {
        const s = useCommunitiesStore.getState()
        const id = s.selectedId
        if (id !== undefined && id !== null && String(id) !== '') {
            communityId = id
        }
    } catch {
        communityId = null
    }

    if (!communityId) {
        // sin comunidad elegida, no tocamos la request
        return cfg
    }

    // Construir headers y params con el contexto
    const headers = {
        ...(cfg.headers as Record<string, string>),
        'X-Community-Id': String(communityId),
    }

    const method = String(cfg.method ?? 'get').toLowerCase()

    if (method === 'get') {
        // merge de params (respetar si ya viene communityId)
        let paramsObj: Record<string, unknown> = {}
        const cur = cfg.params as any
        if (cur instanceof URLSearchParams) {
            cur.forEach((v: string, k: string) => { paramsObj[k] = v })
        } else if (cur && typeof cur === 'object') {
            paramsObj = { ...cur }
        }
        if (paramsObj.communityId === undefined) {
            paramsObj.communityId = communityId
        }
        return { ...cfg, headers, params: paramsObj as any }
    }

    // Para métodos con body, agregamos communityId si no está
    if (cfg.data && typeof cfg.data === 'object' && !(cfg.data as any).communityId) {
        (cfg.data as any).communityId = communityId
    }

    return { ...cfg, headers }
}

const ApiService = {
    fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>,
    ) {
        return new Promise<Response>((resolve, reject) => {
            const rawUrl = String(param?.url ?? '')
            let pathname = rawUrl.toLowerCase()
            try {
                pathname = new URL(rawUrl, 'http://x').pathname.toLowerCase()
            } catch { void 0 }

            const isEcom = pathname.includes('/dashboard/ecommerce')
            const isProj = pathname.includes('/dashboard/project')

            if (isEcom) {
                const data = {
                    revenue: [],
                    sales: [],
                    stats: {
                        totalProfit: 0,
                        totalIncome: 0,
                        totalExpense: 0,
                        customers: 0,
                        orders: 0,
                        conversionRate: 0,
                    },
                    topProducts: [],
                    recentTransactions: [],
                } as unknown as Response
                resolve(data)
                return
            }

            if (isProj) {
                const data = {
                    overview: [],
                    activities: [],
                    tasks: [],
                    members: [],
                } as unknown as Response
                resolve(data)
                return
            }

            // normalización de /users/*
            const normalizedUrl = normalizeUsersUrl(rawUrl)
            const baseCfg: AxiosRequestConfig<Request> = { ...param, url: normalizedUrl }

            // Inyectar (o no) contexto de comunidad según endpoint
            const finalCfg = withCommunityContext<Request>(baseCfg)

            AxiosBase(finalCfg)
                .then((response: AxiosResponse<Response>) => {
                    resolve(response.data)
                })
                .catch((errors: AxiosError) => {
                    reject(errors)
                })
        })
    },
}

export default ApiService
