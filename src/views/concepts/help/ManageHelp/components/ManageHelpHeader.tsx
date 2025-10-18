import { useNavigate } from 'react-router-dom'
import HelpListSearch from './HelpListSearch'
import HelpTableFilter from './HelpTableFilter'
import Button from '@/components/ui/Button'
import { HiPlus } from 'react-icons/hi'

const ManageHelpHeader = () => {
    const navigate = useNavigate()

    const handleAddNew = () => {
        navigate('/concepts/help/create-help')
    }

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                <h3>Manage Tickets</h3>
                <Button
                    variant="solid"
                    size="sm"
                    icon={<HiPlus />}
                    onClick={handleAddNew}
                >
                    Add New
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4 mt-4">
                <HelpListSearch />
                <HelpTableFilter />
            </div>
        </div>
    )
}

export default ManageHelpHeader
