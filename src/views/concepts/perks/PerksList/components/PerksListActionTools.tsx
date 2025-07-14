import Button from '@/components/ui/Button'
import { TbCloudDownload, TbGift } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import usePerksList from '../hooks/usePerksList'

const PerksListActionTools = () => {
    const navigate = useNavigate()
    const { perksList } = usePerksList()

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <CSVLink
                className="w-full"
                filename="perksList.csv"
                data={perksList}
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
                icon={<TbGift className="text-xl" />}
                onClick={() => navigate('/concepts/perks/perks-create')}
            >
                Add new
            </Button>
        </div>
    )
}

export default PerksListActionTools
