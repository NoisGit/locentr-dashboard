// src/views/concepts/properties/PropertiesList/components/PropertiesListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload } from 'react-icons/tb'
import { CSVLink } from 'react-csv'
import usePropertiesList from '../hooks/usePropertiesList'

const PropertiesListActionTools = () => {
  const { propertiesList } = usePropertiesList()

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink className="w-full md:w-auto" filename="propertiesList.csv" data={propertiesList}>
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full md:w-auto">
          Download
        </Button>
      </CSVLink>
    </div>
  )
}

export default PropertiesListActionTools
