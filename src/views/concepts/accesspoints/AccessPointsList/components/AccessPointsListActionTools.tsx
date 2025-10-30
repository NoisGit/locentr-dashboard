// src/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload } from 'react-icons/tb'
import { CSVLink } from 'react-csv'
import useAccessPointsList from '../hooks/useAccessPointsList'

const csvHeaders = [
  { label: 'Nombre',    key: 'name' },
  { label: 'Rol',       key: 'role' },
  { label: 'Comunidad', key: 'community' },
  { label: 'Ubicación', key: 'location' },
  { label: 'Estado',    key: 'active' },
]

const AccessPointsListActionTools = () => {
  const { list } = useAccessPointsList()

  const csvData = (list ?? []).map((d) => {
    const name =
      (d as any)?.full_name?.toString?.() ||
      d.name ||
      ''

    const activeText =
      typeof d.active === 'boolean'
        ? (d.active ? 'Activo' : 'Inactivo')
        : ''

    return {
      name,
      role: d.role ?? '',
      community: d.community ?? '',
      location: d.location ?? '',
      active: activeText,
    }
  })

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink
        className="w-full"
        filename="accesspoints.csv"
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

export default AccessPointsListActionTools
