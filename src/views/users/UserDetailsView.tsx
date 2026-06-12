import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbArrowLeft, TbPencil, TbPower } from 'react-icons/tb'
import { apiDeleteUser, apiGetUserById } from '@/services/UsersService'
import { useAuth } from '@/auth'
import { Permission, RBAC, Role } from '@/utils/rbac'
import { getApiErrorMessage } from '@/utils/apiError'

const roleLabels: Record<string, string> = {
    SUPERADMIN: 'Superadministrador',
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    CLIENT: 'Cliente',
}

function formatDate(value?: string | null) {
    if (!value) return 'No informada'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No informada'

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date)
}

const UserDetailsView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const userId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const { user: currentUser } = useAuth()
    const [isDeactivating, setIsDeactivating] = useState(false)

    const {
        data: user,
        error,
        isLoading,
    } = useSWR(
        userId ? ['users:detail', userId] : null,
        ([, currentId]) => apiGetUserById(currentId as string),
        { revalidateOnFocus: false },
    )

    const isAdmin = RBAC.hasRole(currentUser, Role.ADMIN)
    const canEdit =
        RBAC.hasPermission(currentUser, Permission.EDIT_USER) &&
        user?.role !== Role.SUPERADMIN &&
        !(isAdmin && (user?.role === Role.ADMIN || user?.role === Role.SUPERADMIN))
    const canDeactivate =
        RBAC.hasPermission(currentUser, Permission.DEACTIVATE_USER) &&
        user?.role !== Role.SUPERADMIN &&
        String(currentUser.id) !== userId

    const handleDeactivate = async () => {
        if (!userId) return
        if (
            !window.confirm(
                'El usuario perderá acceso al panel. Esta acción conserva su historial.',
            )
        ) {
            return
        }

        try {
            setIsDeactivating(true)
            await apiDeleteUser(userId)
            toast.push(
                <Notification type="success">Usuario desactivado correctamente.</Notification>,
                { placement: 'top-center' },
            )
            navigate('/users')
        } catch (deactivateError) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(deactivateError, 'No se pudo desactivar el usuario.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsDeactivating(false)
        }
    }

    if (!isLoading && error) {
        return (
            <EmptyState
                title="No fue posible cargar el usuario"
                description={getApiErrorMessage(error, 'Revisa la conexión e intenta nuevamente.')}
                actionLabel="Volver a usuarios"
                onAction={() => navigate('/users')}
            />
        )
    }

    return (
        <Loading loading={isLoading}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3>Detalle de usuario</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Información de perfil, contacto y rol en Locentr.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button icon={<TbArrowLeft />} onClick={() => navigate('/users')}>
                            Volver
                        </Button>
                        {userId && canEdit ? (
                            <Button
                                variant="solid"
                                icon={<TbPencil />}
                                onClick={() => navigate(`/users/${userId}/edit`)}
                            >
                                Editar
                            </Button>
                        ) : null}
                        {userId && canDeactivate ? (
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
                            <div className="font-medium">
                                {user?.full_name || user?.name || 'Sin nombre'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                            <div className="font-medium">{user?.email || 'Sin correo'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Usuario</div>
                            <div className="font-medium">{user?.username || 'No informado'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Rol</div>
                            <div className="font-medium">
                                {roleLabels[String(user?.role)] || 'Sin rol'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Estado</div>
                            <div className="font-medium">
                                {user?.is_active === false || user?.status === false
                                    ? 'Inactivo'
                                    : 'Activo'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Fecha de creación
                            </div>
                            <div className="font-medium">{formatDate(user?.created_at)}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </Loading>
    )
}

export default UserDetailsView
