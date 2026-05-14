import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { apiGetUserById } from '@/services/UsersService'
import { getCoredeckRoleLabel } from '@/utils/rbac'
import { TbArrowLeft, TbPencil } from 'react-icons/tb'

type ApiUser = Record<string, any>

function getDisplayName(user: ApiUser): string {
  const nameParts = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return user.full_name || user.name || nameParts || 'Usuario sin nombre'
}

function getRoleLabel(user: ApiUser): string {
  const rawRole =
    typeof user.role === 'string'
      ? user.role
      : user.role?.name ?? user.role_name ?? ''

  return getCoredeckRoleLabel(rawRole) || rawRole || 'Sin rol'
}

const UsersDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])

  const { data, isLoading } = useSWR(
    userId ? ['users:detail', userId] : null,
    ([, currentId]) => apiGetUserById(currentId as string),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const user = (data || {}) as ApiUser
  const displayName = getDisplayName(user)
  const displayRole = getRoleLabel(user)
  const avatarSrc = user.avatar || user.avatar_url || user.photoURL || user.photo_url || ''

  return (
    <Loading loading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3>Detalle de usuario</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Información general del usuario seleccionado.
            </p>
          </div>
          <div className="flex gap-2">
            <Button icon={<TbArrowLeft />} onClick={() => navigate('/concepts/users/users-list')}>
              Volver
            </Button>
            {userId ? (
              <Button
                variant="solid"
                icon={<TbPencil />}
                onClick={() => navigate(`/concepts/users/users-edit/${userId}`)}
              >
                Editar
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <Avatar size={96} shape="circle" src={avatarSrc} />
            <div className="flex flex-col gap-1">
              <h4>{displayName}</h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {user.email || 'Sin correo'}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {displayRole}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Nombre completo</div>
              <div className="font-medium">{displayName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Correo</div>
              <div className="font-medium">{user.email || 'Sin correo'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Teléfono</div>
              <div className="font-medium">{user.phone || user.phone_number || 'Sin teléfono'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Rol</div>
              <div className="font-medium">{displayRole}</div>
            </div>
          </div>
        </Card>
      </div>
    </Loading>
  )
}

export default UsersDetails
