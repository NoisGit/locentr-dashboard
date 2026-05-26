import Input from '@/components/ui/Input'
import type { ScopeOption, ScopeType } from '../types'

const scopeOptions: ScopeOption[] = [
    { value: 'location', label: 'Location' },
    { value: 'company', label: 'Company' },
    { value: 'portfolio', label: 'Admin portfolio' },
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
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Scope</label>
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
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Location ID</label>
                <Input
                    disabled={scope !== 'location'}
                    placeholder="Location ID"
                    value={locationId}
                    onChange={(event) => setLocationId(event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Company ID</label>
                <Input
                    disabled={scope !== 'company'}
                    placeholder="Company ID"
                    value={companyId}
                    onChange={(event) => setCompanyId(event.target.value)}
                />
            </div>
        </div>
    )
}

export default ScopeControls
