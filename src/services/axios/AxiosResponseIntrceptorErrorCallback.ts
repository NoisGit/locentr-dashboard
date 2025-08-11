// AxiosResponseIntrceptorErrorCallback.ts
import { useSessionUser, useToken } from '@/store/authStore'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import type { AxiosError } from 'axios'

const UNAUTHORIZED_CODES = [401, 419, 440]

// evita múltiples redirecciones simultáneas
let isRedirecting = false

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
  const status = error.response?.status

  if (status && UNAUTHORIZED_CODES.includes(status)) {
    try {
      // limpia access + refresh token (según tu store)
      const { clearToken } = useToken()
      clearToken?.()
    } catch {}

    try {
      // resetea estado de sesión + user
      useSessionUser.getState().resetAuth()
    } catch {
      // fallback manual por si acaso
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

    // si ya estamos en /auth/* no redirigimos otra vez
    const { pathname, search } = window.location
    const onAuth = pathname.startsWith('/auth')

    if (!onAuth && !isRedirecting) {
      isRedirecting = true
      const redirect = encodeURIComponent(`${pathname}${search}`)
      const dest = `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${redirect}`
      window.location.replace(dest)
    }
  }

  // siempre propaga el error para que quien llamó pueda manejarlo si quiere
  return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
