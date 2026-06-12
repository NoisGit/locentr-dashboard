import { useEffect } from 'react'
import useSWR from 'swr'
import {
    apiGetLocationDashboardStats,
    type DashboardStatsResponse,
} from '@/services/DashboardService'
import {
    apiGetLocationsList,
    type GetLocationsListResponse,
} from '@/services/LocationsService'
import { useSessionUser } from '@/store/authStore'
import {
    isVirtualCompanyId,
    useCompaniesStore,
} from '@/store/companies/CompaniesStore'

const getCurrentLocationId = () => {
    try {
        const value = localStorage.getItem('current_location_id') || ''
        const locationId = Number(value)
        return Number.isInteger(locationId) && locationId > 0 ? String(locationId) : ''
    } catch {
        return ''
    }
}

const useLocationDashboard = () => {
    const userCompanyId = useSessionUser((state) => state.user.company_id)
    const selectedCompanyId = useCompaniesStore((state) => state.selectedId)
    const companyId =
        selectedCompanyId !== undefined &&
        selectedCompanyId !== null &&
        !isVirtualCompanyId(selectedCompanyId)
            ? selectedCompanyId
            : (userCompanyId ?? undefined)
    const storedLocationId = getCurrentLocationId()
    const {
        data: locationsPage,
        error: locationsError,
        isLoading: locationsLoading,
    } = useSWR<GetLocationsListResponse>(
        companyId ? ['dashboard:locations', companyId] : null,
        () =>
            apiGetLocationsList({
                pageIndex: 1,
                pageSize: 100,
                companyId,
            }),
        { revalidateOnFocus: false },
    )
    const locations = locationsPage?.list ?? []
    const storedLocationIsVisible = locations.some(
        (location) => String(location.id) === storedLocationId,
    )
    const locationId = storedLocationIsVisible
        ? storedLocationId
        : locations[0]?.id
          ? String(locations[0].id)
          : ''

    useEffect(() => {
        if (!locationId) return
        try {
            localStorage.setItem('current_location_id', locationId)
        } catch {}
    }, [locationId])

    const {
        data,
        error: dashboardError,
        isLoading: dashboardLoading,
        mutate,
    } = useSWR<DashboardStatsResponse>(
        locationId ? ['dashboard:location', locationId] : null,
        ([, currentLocationId]) => apiGetLocationDashboardStats(String(currentLocationId)),
        { revalidateOnFocus: false },
    )

    return {
        data,
        error: locationsError || dashboardError,
        isLoading: locationsLoading || dashboardLoading,
        locationId,
        mutate,
    }
}

export default useLocationDashboard
