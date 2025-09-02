// src/services/ApiService.ts
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
    } catch { /* noop */ }
    return rawUrl
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

            const cfg: AxiosRequestConfig<Request> = { ...param, url: normalizeUsersUrl(rawUrl) }

            AxiosBase(cfg)
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
