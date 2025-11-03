// src/views/concepts/condos/CondosList/components/CondosListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router' // dejo igual que tu archivo original
import { CSVLink } from 'react-csv'
import useCondosList from '../hooks/useCondosList'
import { useAuth } from '@/auth'

const CondosListActionTools = () => {
  const navigate = useNavigate()
  const { condosList } = useCondosList()
  const { user } = useAuth()

  // normalizo por si el backend manda minúsculas o mixed case
  const role = (user?.role ?? '').toString().toUpperCase()
  const isSuperAdmin = role === 'SUPERADMIN'

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink className="w-full" filename="condosList.csv" data={condosList}>
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full">
          Download
        </Button>
      </CSVLink>

      {/* Botón visible SOLO para SUPERADMIN */}
      {isSuperAdmin && (
        <Button
          variant="solid"
          icon={<TbUserPlus className="text-xl" />}
          onClick={() => navigate('/concepts/condos/condos-create')}
          data-test="condos-add-new"
        >
          Add new
        </Button>
      )}
    </div>
  )
}

export default CondosListActionTools
