import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { apiGetCompaniesPage, filterCompaniesForUser } from '@/services/CompaniesService'
import { apiGetLocationsList } from '@/services/LocationsService'
import type { ScopeOption, ScopeType } from '../types'
import { useSessionUser } from '@/store/authStore'

const scopeOptions: ScopeOption[] = [
    { value: 'location', label: 'Edificio' },
    { value: 'company', label: 'Empresa' },
]

type ScopeControlsProps = {
    scope: ScopeType
    setScope: (scope: ScopeType) => void
    locationId: string
    setLocationId: (value: string) => void
    companyId: string
    setCompanyId: (value: string) => void
}

const ScopeControls = ({
    scope,
    setScope,
    locationId,
    setLocationId,
    companyId,
    setCompanyId,
}: ScopeControlsProps) => {
    const role = useSessionUser((state) => state.user.role)
    const userCompanyId = useSessionUser((state) => state.user.company_id)
    const { data: companiesPage, isLoading: companiesLoading } = useSWR(
        ['access-scope:companies', role, userCompanyId],
        () => apiGetCompaniesPage({ pageIndex: 1, pageSize: 200 }),
        { revalidateOnFocus: false },
    )
    const companies = filterCompaniesForUser(companiesPage?.items ?? [], role, userCompanyId)
    const { data: locationsData, isLoading: locationsLoading } = useSWR(
        companyId ? ['access-scope:buildings', companyId] : null,
        () =>
            apiGetLocationsList({
                pageIndex: 1,
                pageSize: 100,
                companyId,
            }),
        { revalidateOnFocus: false },
    )
    const locations = useMemo(() => locationsData?.list ?? [], [locationsData?.list])

    useEffect(() => {
        if (!locationsLoading && !locationId) {
            const suggestedId = localStorage.getItem('current_location_id') || ''
            if (locations.some((location) => String(location.id) === suggestedId)) {
                setLocationId(suggestedId)
                return
            }

            if (locations[0]) {
                setLocationId(String(locations[0].id))
            }
        }

        if (
            !locationsLoading &&
            locationId &&
            !locations.some((location) => String(location.id) === locationId)
        ) {
            setLocationId('')
        }
    }, [locationId, locations, locationsLoading, setLocationId])

    useEffect(() => {
        if (
            !companiesLoading &&
            companyId &&
            !companies.some((company) => String(company.id) === companyId)
        ) {
            setCompanyId('')
        }
    }, [companies, companiesLoading, companyId, setCompanyId])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Alcance
                </label>
                <select
                    className="input input-md h-11"
                    value={scope}
                    onChange={(event) => setScope(event.target.value as ScopeType)}
                >
                    {scopeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Edificio
                </label>
                <select
                    className="input input-md h-11"
                    disabled={scope !== 'location'}
                    value={locationId}
                    onChange={(event) => setLocationId(event.target.value)}
                >
                    <option value="">
                        {locationsLoading ? 'Cargando edificios...' : 'Selecciona un edificio'}
                    </option>
                    {locations.map((location) => (
                        <option key={location.id} value={String(location.id)}>
                            {location.name || 'Edificio sin nombre'}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Empresa
                </label>
                <select
                    className="input input-md h-11"
                    disabled={scope !== 'company'}
                    value={companyId}
                    onChange={(event) => setCompanyId(event.target.value)}
                >
                    <option value="">
                        {companiesLoading ? 'Cargando empresas...' : 'Selecciona una empresa'}
                    </option>
                    {companies.map((company) => (
                        <option key={company.id} value={String(company.id)}>
                            {company.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default ScopeControls
