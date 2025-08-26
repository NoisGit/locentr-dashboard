// src/views/concepts/properties/PropertiesList/components/PropertiesListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import { CSVLink } from 'react-csv'
import usePropertiesList from '../hooks/usePropertiesList'

const PropertiesListActionTools = () => {
  const navigate = useNavigate()
  const { propertiesList } = usePropertiesList()

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink className="w-full" filename="propertiesList.csv" data={propertiesList}>
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full">
          Download
        </Button>
      </CSVLink>
      <Button
        variant="solid"
        icon={<TbUserPlus className="text-xl" />}
        onClick={() => navigate('/concepts/properties/properties-create')}
      >
        Add new
      </Button>
    </div>
  )
}

export default PropertiesListActionTools
