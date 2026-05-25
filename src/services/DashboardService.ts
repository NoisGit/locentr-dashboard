import ApiService from '@/services/ApiService'

export const DASHBOARD_BASE = '/api/v1/dashboard'

export type DashboardWhitelistKpis = {
    today: number
    total: number
}

export type DashboardBlacklistKpis = {
    total: number
}

export type DashboardKpis = {
    historical_total: number
    entries_today: number
    currently_inside: number
    whitelist: DashboardWhitelistKpis
    blacklist: DashboardBlacklistKpis
}

export type DashboardGenderDistribution = {
    male: number
    female: number
}

export type DashboardEntriesByMonthItem = {
    month: string
    count: number
}

export type DashboardEntriesByMonth = {
    entries_by_month: DashboardEntriesByMonthItem[]
}

export type DashboardCharts = {
    gender_distribution: DashboardGenderDistribution
    entries_by_month: DashboardEntriesByMonth
}

export type DashboardRecentEntry = {
    name: string
    identifier: string
    destination: string
    timestamp: string
}

export type DashboardStatsResponse = {
    kpis: DashboardKpis
    charts: DashboardCharts
    recent_entries: DashboardRecentEntry[]
}

function cleanLocationId(locationId: string | number) {
    return encodeURIComponent(String(locationId).replace(/\/+$/, ''))
}

export async function apiGetLocationDashboardStats(locationId: string | number) {
    return ApiService.fetchDataWithAxios<DashboardStatsResponse>({
        url: `${DASHBOARD_BASE}/location/${cleanLocationId(locationId)}`,
        method: 'get',
    })
}

const DashboardApi = {
    apiGetLocationDashboardStats,
}

export default DashboardApi
