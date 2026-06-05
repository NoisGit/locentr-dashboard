import AxiosBase from './axios/AxiosBase'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

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

const ApiService = {
  fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
    param: AxiosRequestConfig<Request>,
  ) {
    return new Promise<Response>((resolve, reject) => {
      const rawUrl = String(param?.url ?? '')
      const normalizedUrl = normalizeUsersUrl(rawUrl)
      const finalCfg: AxiosRequestConfig<Request> = { ...param, url: normalizedUrl }

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
