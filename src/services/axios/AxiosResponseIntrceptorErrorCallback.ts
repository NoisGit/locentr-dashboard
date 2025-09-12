// src/services/axios/AxiosResponseIntrceptorErrorCallback.ts
import { useSessionUser, useToken } from '@/store/authStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import type { AxiosError } from 'axios'

const UNAUTHORIZED_CODES = [401, 419, 440]
const FORBIDDEN_CODES = [403]
const COMMUNITY_SELECT_PATH = '/auth/community-select'

// Evita múltiples redirecciones simultáneas
let isRedirecting = false

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

function headerHasCommunityId(h?: unknown): boolean {
  if (!h || typeof h !== 'object') return false
  const entries = Object.entries(h as Record<string, unknown>)
  return entries.some(([k]) => k.toLowerCase() === 'x-community-id')
}

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
  const status = error.response?.status
  const pathname = getPathname(error.config?.url)

  // 1) Auth expirada / inválida -> limpiar sesión y redirigir a sign-in
  if (status && UNAUTHORIZED_CODES.includes(status)) {
    try {
      const { clearToken } = useToken()
      clearToken?.()
    } catch {}

    try {
      useSessionUser.getState().resetAuth()
    } catch {
      try {
        useSessionUser.getState().setUser({
          avatar: '',
          userName: '',
          email: '',
          authority: [],
        })
        useSessionUser.getState().setSessionSignedIn(false)
      } catch {}
    }

    // limpiar comunidad también (evita arrastrar una selección vieja)
    try {
      useCommunitiesStore.getState().clearCommunity()
    } catch {}

    if (!onAuthPath(pathname) && !isRedirecting) {
      isRedirecting = true
      const redirect = encodeURIComponent(`${pathname}${window.location.search}`)
      const dest = `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${redirect}`
      window.location.replace(dest)
    }
  }

  // 2) Prohibido (comunidad no autorizada o inválida):
  // si enviamos x-community-id, limpiamos selección y mandamos al selector.
  if (status && FORBIDDEN_CODES.includes(status)) {
    const hadCommunityHeader = headerHasCommunityId(error.config?.headers)

    if (hadCommunityHeader) {
      try {
        useCommunitiesStore.getState().clearCommunity()
      } catch {}

      const onAuth = onAuthPath(pathname)
      if (!onAuth && !isRedirecting) {
        isRedirecting = true
        window.location.replace(COMMUNITY_SELECT_PATH)
      }
    }
  }

  return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
