import Button from '@/components/ui/Button'
import { TbArrowLeft, TbPencil } from 'react-icons/tb'

type WorkspaceDetailsHeaderProps = {
    title?: string
    workspaceId: string
    onBack: () => void
    onEdit: () => void
}

const WorkspaceDetailsHeader = ({
    title,
    workspaceId,
    onBack,
    onEdit,
}: WorkspaceDetailsHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
                <h3>{title || 'Workspace details'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Security, access and operational controls for this location.
                </p>
            </div>
            <div className="flex gap-2">
                <Button icon={<TbArrowLeft />} onClick={onBack}>
                    Back
                </Button>
                {workspaceId ? (
                    <Button variant="solid" icon={<TbPencil />} onClick={onEdit}>
                        Edit
                    </Button>
                ) : null}
            </div>
        </div>
    )
}

export default WorkspaceDetailsHeader
