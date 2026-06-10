import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { TbArrowLeft, TbPencil } from 'react-icons/tb'
import { apiGetUserById } from '@/services/UsersService'

type UserDetail = {
    id?: string | number
    name?: string
    full_name?: string
    email?: string
    phone?: string
    phone_number?: string
    role?: string | { name?: string }
    role_name?: string
}

function normalizeUser(data: unknown): UserDetail {
    if (!data || typeof data !== 'object') return {}
    const record = data as Record<string, unknown>
    if (record.data && typeof record.data === 'object') return record.data as UserDetail
    return record as UserDetail
}

const UserDetailsView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const userId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])

    const { data, isLoading } = useSWR(
        userId ? ['users:detail', userId] : null,
        ([, currentId]) => apiGetUserById(currentId as string),
        { revalidateOnFocus: false },
    )

    const user = normalizeUser(data)
    const role = typeof user.role === 'object' ? user.role?.name : user.role

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
                        {userId ? (
                            <Button
                                variant="solid"
                                icon={<TbPencil />}
                                onClick={() => navigate(`/users/${userId}/edit`)}
                            >
                                Editar
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Nombre</div>
                            <div className="font-medium">{user.full_name || user.name || 'Sin nombre'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                            <div className="font-medium">{user.email || 'Sin correo'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Teléfono</div>
                            <div className="font-medium">{user.phone || user.phone_number || 'Sin teléfono'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Rol</div>
                            <div className="font-medium">{role || user.role_name || 'Sin rol'}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </Loading>
    )
}

export default UserDetailsView
