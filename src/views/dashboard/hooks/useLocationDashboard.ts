import useSWR from 'swr'
import {
    apiGetLocationDashboardStats,
    type DashboardStatsResponse,
} from '@/services/DashboardService'

const getCurrentLocationId = () => {
    try {
        return localStorage.getItem('current_location_id') || ''
    } catch {
        return ''
    }
}

const useLocationDashboard = () => {
    const locationId = getCurrentLocationId()

    const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
        locationId ? ['dashboard:location', locationId] : null,
        ([, currentLocationId]) =>
            apiGetLocationDashboardStats(String(currentLocationId)),
        { revalidateOnFocus: false },
    )

    return {
        data,
        error,
        isLoading,
        locationId,
        mutate,
    }
}

export default useLocationDashboard
