// src/views/concepts/condos/CondosList/components/CondosListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import { CSVLink } from 'react-csv'
import useCondosList from '../hooks/useCondosList'

const CondosListActionTools = () => {
  const navigate = useNavigate()
  const { condosList } = useCondosList()

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink className="w-full" filename="condosList.csv" data={condosList}>
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full">
          Download
        </Button>
      </CSVLink>
      <Button
        variant="solid"
        icon={<TbUserPlus className="text-xl" />}
        onClick={() => navigate('/concepts/condos/condos-create')}
      >
        Add new
      </Button>
    </div>
  )
}

export default CondosListActionTools
