// src/views/concepts/residents/ResidentsList/components/ResidentsListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload } from 'react-icons/tb'
import { CSVLink } from 'react-csv'
import useResidentsList from '../hooks/useResidentsList'

const ResidentsListActionTools = () => {
  const { residentsList } = useResidentsList()

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <CSVLink className="w-full" filename="residentsList.csv" data={residentsList}>
        <Button icon={<TbCloudDownload className="text-xl" />} className="w-full">
          Download
        </Button>
      </CSVLink>
    </div>
  )
}

export default ResidentsListActionTools
