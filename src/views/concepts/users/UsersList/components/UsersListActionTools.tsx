import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import useUsersList from '../hooks/useUsersList'
import { CSVLink } from 'react-csv'
import { getCoredeckRoleLabel } from '@/utils/rbac'

function normalizeRole(raw: unknown): string {
  return getCoredeckRoleLabel(raw) || String(raw ?? '')
}

const UsersListActionTools = () => {
  const navigate = useNavigate()
  const { usersList } = useUsersList()

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Nombre', key: 'name' },
    { label: 'Correo', key: 'email' },
    { label: 'Teléfono', key: 'phone' },
    { label: 'Rol', key: 'role' },
  ]

  const csvData = (usersList || []).map((user) => ({
    id: user.id,
    name:
      (user as any).name ??
      (user as any).full_name ??
      [ (user as any).first_name, (user as any).last_name ].filter(Boolean).join(' ') ??
      '',
    email: (user as any).email ?? '',
    phone: (user as any).phone ?? (user as any).phone_number ?? '',
    role: normalizeRole((user as any).role ?? (user as any).role_name),
  }))

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {csvData.length > 0 ? (
        <CSVLink
          className="w-full"
          filename="usuarios.csv"
          data={csvData}
          headers={csvHeaders}
        >
          <Button icon={<TbCloudDownload className="text-xl" />} className="w-full">
            Descargar
          </Button>
        </CSVLink>
      ) : (
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full" disabled>
          Descargar
        </Button>
      )}

      <Button
        variant="solid"
        icon={<TbUserPlus className="text-xl" />}
        onClick={() => navigate('/concepts/users/users-create')}
      >
        Crear usuario
      </Button>
    </div>
  )
}

export default UsersListActionTools
