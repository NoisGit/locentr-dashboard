// src/services/ApiService.ts
import AxiosBase from './axios/AxiosBase'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

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

            // ---- Mock seguro para el dashboard/ecommerce
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

            // ---- Mock seguro para el dashboard/project
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

            AxiosBase(param)
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
