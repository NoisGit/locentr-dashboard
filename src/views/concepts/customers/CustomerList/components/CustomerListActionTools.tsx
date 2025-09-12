// src/views/concepts/users/CustomerList/components/CustomerListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import useCustomerList from '../hooks/useCustomerList'
import { CSVLink } from 'react-csv'

function normalizeRole(raw: unknown): string {
  const r = String(raw ?? '').toLowerCase()
  if (r.includes('super') && r.includes('admin')) return 'Super Administrador'
  if (r.includes('admin') && !r.includes('sub')) return 'Administrador'
  return String(raw ?? '')
}

const CustomerListActionTools = () => {
  const navigate = useNavigate()
  const { customerList } = useCustomerList()

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Nombre', key: 'name' },
    { label: 'Correo', key: 'email' },
    { label: 'Teléfono', key: 'phone' },
    { label: 'Rol', key: 'role' },
  ]

  const csvData = (customerList || []).map((u) => ({
    id: u.id,
    name:
      (u as any).name ??
      (u as any).full_name ??
      [ (u as any).first_name, (u as any).last_name ].filter(Boolean).join(' ') ??
      '',
    email: (u as any).email ?? '',
    phone: (u as any).phone ?? (u as any).phone_number ?? '',
    role: normalizeRole((u as any).role ?? (u as any).role_name),
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

export default CustomerListActionTools
