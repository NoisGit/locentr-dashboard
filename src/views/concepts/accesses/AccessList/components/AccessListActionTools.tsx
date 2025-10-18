import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import useAccessList from '../hooks/useAccessList'

const AccessListActionTools = () => {
    const navigate = useNavigate()
    const { accessList } = useAccessList()

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <CSVLink
                className="w-full"
                filename="accessList.csv"
                data={accessList}
            >
                <Button
                    icon={<TbCloudDownload className="text-xl" />}
                    className="w-full"
                >
                    Download
                </Button>
            </CSVLink>
            <Button
                variant="solid"
                icon={<TbUserPlus className="text-xl" />}
                onClick={() => navigate('/concepts/accesses/access-create')}
            >
                Add new
            </Button>
        </div>
    )
}

export default AccessListActionTools
