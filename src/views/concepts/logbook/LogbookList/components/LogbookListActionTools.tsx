import Button from '@/components/ui/Button'
import { TbCloudDownload, TbPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import useLogbookList from '../hooks/useLogbookList'
import { CSVLink } from 'react-csv'

const LogbookListActionTools = () => {
    const navigate = useNavigate()

    const { logbookList } = useLogbookList() 

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <CSVLink filename="logbook-list.csv" data={logbookList}>
                <Button icon={<TbCloudDownload className="text-xl" />}>
                    Export
                </Button>
            </CSVLink>
            <Button
                variant="solid"
                icon={<TbPlus className="text-xl" />}
                onClick={() => navigate('/concepts/logbook/logbook-create')}
            >
                Add item
            </Button>
        </div>
    )
}

export default LogbookListActionTools
