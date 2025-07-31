import Avatar from '@/components/ui/Avatar'
import { TbUser } from 'react-icons/tb'
import type { HelpReply } from '../../manageHelp/types'

type Props = {
    replies: HelpReply[]
}

const HelpReplyList = ({ replies }: Props) => {
    if (!replies || replies.length === 0) {
        return <p className="text-sm text-gray-500 mt-6">No replies yet.</p>
    }

    return (
        <div className="mt-6 space-y-4">
            {replies.map((reply, index) => (
                <div key={index} className="flex gap-3">
                    <Avatar
                        icon={<TbUser />}
                        size={32}
                        shape="circle"
                        className="bg-gray-300 text-white"
                    />
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg w-full">
                        <div className="text-xs text-gray-500 mb-1">
                            {reply.author ?? 'Unknown'} —{' '}
                            {reply.date ?? 'Just now'}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {reply.message}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default HelpReplyList
