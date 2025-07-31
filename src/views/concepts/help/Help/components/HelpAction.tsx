import { useState, useRef } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { TbMessageCircle, TbSend } from 'react-icons/tb'
import type { HelpTicket } from '../../manageHelp/types'

type LocalReply = {
    message: string
    date: string
    author: string
}

type HelpActionProps = {
    ticket?: HelpTicket
}

const HelpAction = ({ ticket }: HelpActionProps) => {
    const responseInput = useRef<HTMLTextAreaElement>(null)
    const [responses, setResponses] = useState<LocalReply[]>([])

    const handleSubmitResponse = () => {
        const message = responseInput.current?.value?.trim()
        if (message) {
            const newReply = {
                message,
                date: new Date().toLocaleString(),
                author: 'Support Agent',
            }
            setResponses((prev) => [...prev, newReply])
            if (responseInput.current) {
                responseInput.current.value = ''
            }
        }
    }

    return (
        <>
            <Card bordered className="mt-8" bodyClass="space-y-4">
                <h5 className="flex items-center gap-2 text-lg font-semibold">
                    <TbMessageCircle className="text-xl" />
                    Respond to Ticket
                </h5>
                <Textarea
                    ref={responseInput}
                    placeholder="Write your response here..."
                    rows={4}
                    className="rounded-md w-full"
                />
                <div className="flex justify-end">
                    <Button
                        variant="solid"
                        icon={<TbSend />}
                        onClick={handleSubmitResponse}
                    >
                        Send Response
                    </Button>
                </div>
            </Card>

            {responses.length > 0 && (
                <div className="mt-12">
                    <h4 className="mb-4 font-semibold text-base">Replies</h4>
                    <ul className="space-y-2">
                        {responses.map((res, idx) => (
                            <li
                                key={idx}
                                className="p-3 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"
                            >
                                <div className="text-xs text-gray-500 mb-1">
                                    {res.author} — {res.date}
                                </div>
                                <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                                    {res.message}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}

export default HelpAction
