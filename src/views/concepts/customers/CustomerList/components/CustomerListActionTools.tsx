// src/views/concepts/users/CustomerList/components/CustomerListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import useCustomerList from '../hooks/useCustomerList'
import { CSVLink } from 'react-csv'

const CustomerListActionTools = () => {
  const navigate = useNavigate()
  const { customerList } = useCustomerList()

  // Encabezados explícitos para el CSV
  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Full Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Role', key: 'role' },
  ]

  // Asegurar datos planos (por si algún campo viene undefined)
  const csvData = (customerList || []).map((u) => ({
    id: u.id,
    name: u.name ?? '',
    email: u.email ?? '',
    phone: u.phone ?? '',
    role: (u as any).role ?? '',
  }))

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {csvData.length > 0 ? (
        <CSVLink
          className="w-full"
          filename="customerList.csv"
          data={csvData}
          headers={csvHeaders}
        >
          <Button
            icon={<TbCloudDownload className="text-xl" />}
            className="w-full"
          >
            Download
          </Button>
        </CSVLink>
      ) : (
        <Button
          icon={<TbCloudDownload className="text-xl" />}
          className="w-full"
          disabled
        >
          Download
        </Button>
      )}

      <Button
        variant="solid"
        icon={<TbUserPlus className="text-xl" />}
        onClick={() => navigate('/concepts/users/users-create')}
      >
        Add new
      </Button>
    </div>
  )
}

export default CustomerListActionTools
