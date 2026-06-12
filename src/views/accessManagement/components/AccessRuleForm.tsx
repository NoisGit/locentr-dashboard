import Button from '@/components/ui/Button'
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
        <section className="border-y border-gray-200 py-5 dark:border-gray-800">
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
                        placeholder="Documento de identidad"
                        value={idNumber}
                        onChange={(event) => setIdNumber(event.target.value)}
                    />
                    <Input
                        placeholder="Nombre completo"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                    />
                    <Input
                        placeholder="Motivo"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                    />
                    <Input
                        disabled={type === 'blacklist'}
                        placeholder="Patente del vehículo"
                        value={vehiclePlate}
                        onChange={(event) => setVehiclePlate(event.target.value)}
                    />
                </div>
                <div>
                    <Button variant="solid" loading={isSubmitting} onClick={onSubmit}>
                        {type === 'whitelist'
                            ? 'Agregar autorización'
                            : 'Agregar restricción'}
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default AccessRuleForm
