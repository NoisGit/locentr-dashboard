import type { HelpTicket } from '../../manageHelp/types'
import { TbUser } from 'react-icons/tb'
import Avatar from '@/components/ui/Avatar'

type HelpBodyProps = {
    data: HelpTicket
}

const HelpBody = ({ data }: HelpBodyProps) => {
    return (
        <>
            <h3 className="text-2xl font-semibold mb-4">{data.subject}</h3>

            <div className="flex items-center gap-4 mb-6">
                <Avatar
                    icon={<TbUser />}
                    size={40}
                    shape="circle"
                    className="bg-primary text-white"
                />
                <div className="text-sm">
                    <div className="mb-1">
                        From:{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {data.email}
                        </span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                        <span>Last updated: {data.updateTime}</span>
                        <span className="mx-2">•</span>
                        <span>Status: {data.status}</span>
                    </div>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none prose-p:mt-2 prose-headings:font-bold">
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
            </div>
        </>
    )
}

export default HelpBody
