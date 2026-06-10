import useSWR from 'swr'
import { apiListCompanies } from '@/services/CompaniesService'
import { apiGetLocationsList } from '@/services/LocationsService'
import type { ScopeOption, ScopeType } from '../types'

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
    const { data: companies = [], isLoading: companiesLoading } = useSWR(
        'access-scope:companies',
        () => apiListCompanies({ pageIndex: 1, pageSize: 200 }),
        { revalidateOnFocus: false },
    )
    const { data: locationsData, isLoading: locationsLoading } = useSWR(
        'access-scope:buildings',
        () =>
            apiGetLocationsList({
                pageIndex: 1,
                pageSize: 200,
            }),
        { revalidateOnFocus: false },
    )
    const locations = locationsData?.list ?? []

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Alcance</label>
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
                    {locationId &&
                    !locations.some((location) => String(location.id) === locationId) ? (
                        <option value={locationId}>Edificio seleccionado</option>
                    ) : null}
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
