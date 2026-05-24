// src/services/ApiService.ts
import AxiosBase from './axios/AxiosBase'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useCompaniesStore, isVirtualCompanyId } from '@/store/companies/CompaniesStore'
import { useSessionUser } from '@/store/authStore'
import { RBAC } from '@/utils/rbac'
import { Role } from '@/utils/rbac/types'

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

function shouldSkipCompanyContext(pathname: string): boolean {
  const p = stripTrailingSlash(pathname.toLowerCase())
  if (p.startsWith('/api/v1/companies')) return true
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

function withCompanyContext<Request = Record<string, unknown>>(
  cfg: AxiosRequestConfig<Request>,
): AxiosRequestConfig<Request> {
  const url = String(cfg.url ?? '')
  const pathname = getPathname(url)

  if (shouldSkipCompanyContext(pathname)) {
    return cfg
  }

  try {
    const user = useSessionUser.getState().user
    const role = RBAC.extractUserRole(user)
    if (role === Role.SUPERADMIN) {
      return cfg
    }
  } catch {
    void 0
  }

  let companyId: string | number | null = null
  try {
    const state = useCompaniesStore.getState()
    const id = state.selectedId
    if (id !== undefined && id !== null && String(id) !== '' && !isVirtualCompanyId(id)) {
      companyId = id
    }
  } catch {
    companyId = null
  }

  if (!companyId) {
    return cfg
  }

  const nextHeaders: AxiosRequestConfig['headers'] = {
    ...(cfg.headers as AxiosRequestConfig['headers']),
    'X-Company-Id': String(companyId),
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
    if (paramsObj.companyId === undefined) {
      paramsObj.companyId = companyId
    }
    return { ...cfg, headers: nextHeaders, params: paramsObj as unknown as Request }
  }

  if (cfg.data && typeof cfg.data === 'object' && !(cfg.data as Record<string, unknown>).companyId) {
    ;(cfg.data as Record<string, unknown>).companyId = companyId
  }

  return { ...cfg, headers: nextHeaders }
}

const ApiService = {
  fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
    param: AxiosRequestConfig<Request>,
  ) {
    return new Promise<Response>((resolve, reject) => {
      const rawUrl = String(param?.url ?? '')
      const normalizedUrl = normalizeUsersUrl(rawUrl)
      const baseCfg: AxiosRequestConfig<Request> = { ...param, url: normalizedUrl }
      const finalCfg = withCompanyContext<Request>(baseCfg)

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
