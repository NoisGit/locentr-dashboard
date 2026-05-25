import ApiService from '@/services/ApiService'

export const SYSTEM_BASE = '/api/v1/system'

export type SystemCounters = {
    users_admin: number
    users_operators: number
    users_plan_demo: number
    total_entrances: number
    income_today: number
}

export type MonthlyQuantity = {
    year: number
    month: number
    quantity: number
}

export type AdminDetail = {
    id_user: number
    name: string
    email: string
    logo?: string | null
    plan?: string | null
    creation_date: string
    entrances_count: number
    operators_count: number
}

export type SystemStatsData = {
    counters: SystemCounters
    detail_income_by_month: MonthlyQuantity[]
    detail_admins: AdminDetail[]
}

export type SystemStatsResponse = {
    status: string
    message: string
    data: SystemStatsData
}

export async function apiGetSystemStats() {
    return ApiService.fetchDataWithAxios<SystemStatsResponse>({
        url: `${SYSTEM_BASE}/stats`,
        method: 'get',
    })
}

const SystemApi = {
    apiGetSystemStats,
}

export default SystemApi
