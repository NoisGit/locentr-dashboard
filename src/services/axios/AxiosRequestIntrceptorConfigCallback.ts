// AxiosRequestIntrceptorConfigCallback.ts
import appConfig from '@/configs/app.config'
import cookiesStorage from '@/utils/cookiesStorage'
import {
  TOKEN_TYPE, // típicamente "Bearer"
  REQUEST_HEADER_AUTH_KEY, // típicamente "Authorization"
  TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import type { InternalAxiosRequestConfig } from 'axios'

const AxiosRequestIntrceptorConfigCallback = (config: InternalAxiosRequestConfig) => {
  const strategy = appConfig.accessTokenPersistStrategy

  // obtener token según estrategia
  let stored = ''
  try {
    if (strategy === 'localStorage') {
      stored = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else if (strategy === 'sessionStorage') {
      stored = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else {
      // cookies
      stored = cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }
  } catch {
    // ignore
  }

  if (stored) {
    const val = stored.trim()
    // si ya viene con "Bearer " no volvemos a prefixear
    const hasBearer = /^bearer\s/i.test(val)
    const headerValue = hasBearer ? val : `${TOKEN_TYPE} ${val}`
    config.headers = config.headers ?? {}
    ;(config.headers as any)[REQUEST_HEADER_AUTH_KEY] = headerValue
  }

  return config
}

export default AxiosRequestIntrceptorConfigCallback
