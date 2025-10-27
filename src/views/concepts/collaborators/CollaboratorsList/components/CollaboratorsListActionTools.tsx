import Button from '@/components/ui/Button'
import { TbCloudDownload } from 'react-icons/tb'
import { CSVLink } from 'react-csv'
import useCollaboratorsList from '../hooks/useCollaboratorsList'

const csvHeaders = [
  { label: 'Name', key: 'name' },
  { label: 'Email', key: 'email' },
  { label: 'Phone', key: 'phone' },
  { label: 'Role', key: 'role' },
  { label: 'Community', key: 'community' },
  { label: 'Active', key: 'active' },
]

const CollaboratorsListActionTools = () => {
  const { list } = useCollaboratorsList()

  const csvData = (list ?? []).map((c) => ({
    name: c.name ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    role: c.role ?? '',
    community: c.community ?? '',
    active: typeof c.active === 'boolean' ? (c.active ? 'true' : 'false') : '',
  }))

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink
        className="w-full"
        filename="collaborators.csv"
        headers={csvHeaders}
        data={csvData}
      >
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full">
          Download
        </Button>
      </CSVLink>
    </div>
  )
}

export default CollaboratorsListActionTools
