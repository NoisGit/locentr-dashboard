import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { TbExternalLink, TbQrcode } from 'react-icons/tb'

type WorkspacePoliceAccessTabProps = {
    policeLink: string
    isGenerating: boolean
    onGenerate: () => void
}

const WorkspacePoliceAccessTab = ({
    policeLink,
    isGenerating,
    onGenerate,
}: WorkspacePoliceAccessTabProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div>
                    <h5>Police logbook access</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Generate a one-use public link for external review without dashboard login.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <Button
                        variant="solid"
                        icon={<TbQrcode />}
                        loading={isGenerating}
                        onClick={onGenerate}
                    >
                        Generate QR link
                    </Button>
                    {policeLink ? (
                        <a
                            className="inline-flex items-center gap-2 text-primary font-medium"
                            href={policeLink}
                            rel="noreferrer"
                            target="_blank"
                        >
                            Open generated link <TbExternalLink />
                        </a>
                    ) : null}
                </div>
                {policeLink ? (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm break-all">
                        {policeLink}
                    </div>
                ) : null}
            </div>
        </Card>
    )
}

export default WorkspacePoliceAccessTab
