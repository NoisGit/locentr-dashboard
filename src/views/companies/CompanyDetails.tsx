import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbArrowLeft, TbPencil, TbPower } from 'react-icons/tb'
import {
    apiDeactivateCompany,
    apiGetCompanyById,
    type Company,
} from '@/services/CompaniesService'
import { useAuth } from '@/auth'
import { Permission, RBAC, Role } from '@/utils/rbac'

const CompanyDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const companyId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const [isDeactivating, setIsDeactivating] = useState(false)
    const { user } = useAuth()
    const canEdit = RBAC.hasPermission(user, Permission.EDIT_COMPANY)
    const canDeactivate = RBAC.hasRole(user, Role.SUPERADMIN)

    const { data, isLoading } = useSWR(
        companyId ? ['companies:detail', companyId] : null,
        ([, currentId]) => apiGetCompanyById<Company>(currentId as string),
        { revalidateOnFocus: false },
    )

    const handleDeactivate = async () => {
        if (!companyId) return

        const confirmed = window.confirm(
            'La empresa será desactivada. Su historial seguirá disponible si se reactiva más adelante.',
        )

        if (!confirmed) return

        try {
            setIsDeactivating(true)
            await apiDeactivateCompany(companyId)

            toast.push(<Notification type="success">Empresa desactivada correctamente.</Notification>, {
                placement: 'top-center',
            })
            navigate('/companies')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; detail?: string } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'No fue posible desactivar la empresa.'

            toast.push(<Notification type="danger">{message}</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsDeactivating(false)
        }
    }

    return (
        <Loading loading={isLoading}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3>{data?.name || 'Detalle de empresa'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Información operativa y administrativa de la empresa.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button icon={<TbArrowLeft />} onClick={() => navigate('/companies')}>
                            Volver
                        </Button>
                        {companyId && canEdit ? (
                            <Button
                                variant="solid"
                                icon={<TbPencil />}
                                onClick={() => navigate(`/companies/${companyId}/edit`)}
                            >
                                Editar
                            </Button>
                        ) : null}
                        {companyId && canDeactivate ? (
                            <Button
                                icon={<TbPower />}
                                loading={isDeactivating}
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                }
                                onClick={handleDeactivate}
                            >
                                Desactivar
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Nombre</div>
                            <div className="font-medium">{data?.name || 'Sin nombre'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Estado</div>
                            <div>
                                <Tag>{data?.is_active === false ? 'Inactiva' : 'Activa'}</Tag>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Tipo</div>
                            <div className="font-medium">
                                {data?.parent_company_id ? 'Subempresa' : 'Empresa'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Estructura</div>
                            <div className="font-medium">
                                {data?.parent_company_id
                                    ? 'Vinculada a una empresa principal'
                                    : 'Empresa principal'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Actividad</div>
                            <div className="font-medium">{data?.activity || 'Sin actividad informada'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Identificación tributaria</div>
                            <div className="font-medium">{data?.id_number || 'No informada'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Tipo de documento</div>
                            <div className="font-medium">{data?.type_document || 'No informado'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Fecha de creación</div>
                            <div className="font-medium">{data?.created_at || 'No informada'}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </Loading>
    )
}

export default CompanyDetails
