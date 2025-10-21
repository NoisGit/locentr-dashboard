// src/services/axios/AxiosRequestIntrceptorConfigCallback.ts
import appConfig from '@/configs/app.config'
import cookiesStorage from '@/utils/cookiesStorage'
import {
  TOKEN_TYPE,
  REQUEST_HEADER_AUTH_KEY,
  TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import { useSessionUser } from '@/store/authStore'
import { RBAC } from '@/utils/rbac'
import { Role } from '@/utils/rbac/types'
import type { InternalAxiosRequestConfig } from 'axios'

const AUTH_PREFIX = '/auth'
const EXCLUDED_PATHS = ['/api/v1/users/me', '/api/v1/communities/access']
const COMMUNITIES_ROOT = '/api/v1/communities/'

function getPathname(raw?: string): string {
  if (!raw) return ''
  try {
    return new URL(raw, 'http://x').pathname.toLowerCase()
  } catch {
    return String(raw).toLowerCase()
  }
}

function shouldAttachCommunity(pathname: string): boolean {
  if (!pathname) return false
  if (pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)) return false
  for (const p of EXCLUDED_PATHS) {
    if (pathname === p || pathname.startsWith(p)) return false
  }
  if (pathname === '/api/v1/communities' || pathname === COMMUNITIES_ROOT) return false
  return true
}

function getSelectedCommunityIdFromStorage(): string | number | undefined {
  try {
    const raw = localStorage.getItem('current_community')
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as { id?: string | number }
    const id = parsed?.id
    if (id !== undefined && id !== null && String(id) !== '') return id
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
    const val = stored.trim()
    const hasBearer = /^bearer\s/i.test(val)
    const headerValue = hasBearer ? val : `${TOKEN_TYPE} ${val}`
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, unknown>)[REQUEST_HEADER_AUTH_KEY] = headerValue
  }

  const pathname = getPathname(typeof config.url === 'string' ? config.url : undefined)
  const method = String(config.method || 'get').toLowerCase()
  
  // SUPERADMIN no necesita communityId en las peticiones
  if (isSuperAdmin()) {
    return config
  }

  const communityId = getSelectedCommunityIdFromStorage()

  if (communityId !== undefined && shouldAttachCommunity(pathname)) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, unknown>)['x-community-id'] = String(communityId)

    if (!config.params || typeof config.params !== 'object') config.params = {}
    const params = config.params as Record<string, unknown>
    if (!('communityId' in params) && !('community_id' in params)) {
      params['communityId'] = communityId
    }

    if ((method === 'post' || method === 'put' || method === 'patch') && config.data && typeof config.data === 'object') {
      const body = config.data as Record<string, unknown>
      if (!('communityId' in body) && !('community_id' in body)) {
        body['communityId'] = communityId
      }
    }
  }

  return config
}
