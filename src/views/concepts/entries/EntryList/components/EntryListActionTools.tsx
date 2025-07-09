import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import useEntryList from '../hooks/useEntryList'

const EntryListActionTools = () => {
    const navigate = useNavigate()
    const { entryList } = useEntryList()

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <CSVLink
                className="w-full"
                filename="entryList.csv"
                data={entryList}
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
                onClick={() => navigate('/concepts/entries/entry-create')}
            >
                Add new
            </Button>
        </div>
    )
}

export default EntryListActionTools
