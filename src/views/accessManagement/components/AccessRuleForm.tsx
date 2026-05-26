import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import ScopeControls from './ScopeControls'
import type { ListType, ScopeType } from '../types'

type AccessRuleFormProps = {
    type: ListType
    scope: ScopeType
    setScope: (scope: ScopeType) => void
    locationId: string
    setLocationId: (value: string) => void
    companyId: string
    setCompanyId: (value: string) => void
    idNumber: string
    setIdNumber: (value: string) => void
    fullName: string
    setFullName: (value: string) => void
    reason: string
    setReason: (value: string) => void
    vehiclePlate: string
    setVehiclePlate: (value: string) => void
    isSubmitting: boolean
    onSubmit: () => void
}

const AccessRuleForm = ({
    type,
    scope,
    setScope,
    locationId,
    setLocationId,
    companyId,
    setCompanyId,
    idNumber,
    setIdNumber,
    fullName,
    setFullName,
    reason,
    setReason,
    vehiclePlate,
    setVehiclePlate,
    isSubmitting,
    onSubmit,
}: AccessRuleFormProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-4">
                <ScopeControls
                    companyId={companyId}
                    locationId={locationId}
                    scope={scope}
                    setCompanyId={setCompanyId}
                    setLocationId={setLocationId}
                    setScope={setScope}
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                        placeholder="ID number"
                        value={idNumber}
                        onChange={(event) => setIdNumber(event.target.value)}
                    />
                    <Input
                        placeholder="Full name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                    />
                    <Input
                        placeholder="Reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                    />
                    <Input
                        disabled={type === 'blacklist'}
                        placeholder="Vehicle plate"
                        value={vehiclePlate}
                        onChange={(event) => setVehiclePlate(event.target.value)}
                    />
                </div>
                <div>
                    <Button variant="solid" loading={isSubmitting} onClick={onSubmit}>
                        {type === 'whitelist' ? 'Save whitelist record' : 'Save blacklist record'}
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default AccessRuleForm
