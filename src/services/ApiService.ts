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
  } catch {
    void 0
  }
  return rawUrl
}

function stripTrailingSlash(p: string) {
  return p.replace(/\/+$/, '')
}

function getPathname(rawUrl: string): string {
  try {
    return new URL(rawUrl, 'http://x').pathname
  } catch {
    return String(rawUrl).split('?')[0].split('#')[0]
  }
}

function shouldSkipCommunityContext(pathname: string): boolean {
  const p = stripTrailingSlash(pathname.toLowerCase())
  if (p.startsWith('/api/v1/communities')) return true
  if (p === '/api/v1/communities/access') return true
  if (p.startsWith('/api/v1/auth')) return true
  return false
}

function urlSearchParamsToObject(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  sp.forEach((v, k) => {
    out[k] = v
  })
  return out
}

function withCommunityContext<Request = Record<string, unknown>>(
  cfg: AxiosRequestConfig<Request>,
): AxiosRequestConfig<Request> {
  const url = String(cfg.url ?? '')
  const pathname = getPathname(url)

  if (shouldSkipCommunityContext(pathname)) {
    return cfg
  }

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
    return cfg
  }

  const nextHeaders: Record<string, unknown> = {
    ...(cfg.headers as Record<string, unknown> | undefined),
    'X-Community-Id': String(communityId),
  }

  const method = String(cfg.method ?? 'get').toLowerCase()

  if (method === 'get') {
    let paramsObj: Record<string, unknown> = {}
    const cur = cfg.params as unknown
    if (cur instanceof URLSearchParams) {
      paramsObj = urlSearchParamsToObject(cur)
    } else if (cur && typeof cur === 'object') {
      paramsObj = { ...(cur as Record<string, unknown>) }
    }
    if (paramsObj.communityId === undefined) {
      paramsObj.communityId = communityId
    }
    return { ...cfg, headers: nextHeaders, params: paramsObj as unknown as Request }
  }

  if (cfg.data && typeof cfg.data === 'object' && !(cfg.data as Record<string, unknown>).communityId) {
    ;(cfg.data as Record<string, unknown>).communityId = communityId
  }

  return { ...cfg, headers: nextHeaders }
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
      } catch {
        void 0
      }

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

      const normalizedUrl = normalizeUsersUrl(rawUrl)
      const baseCfg: AxiosRequestConfig<Request> = { ...param, url: normalizedUrl }
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
