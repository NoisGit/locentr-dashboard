import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import { CSVLink } from 'react-csv'
import useResidentsList from '../hooks/useResidentsList'

const ResidentsListActionTools = () => {
  const navigate = useNavigate()
  const { residentsList } = useResidentsList()

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink className="w-full" filename="residentsList.csv" data={residentsList}>
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full">
          Download
        </Button>
      </CSVLink>
      <Button
        variant="solid"
        icon={<TbUserPlus className="text-xl" />}
        onClick={() => navigate('/concepts/residents/residents-create')}
      >
        Add new
      </Button>
    </div>
  )
}

export default ResidentsListActionTools
