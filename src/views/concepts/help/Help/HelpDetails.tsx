import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Container from '@/components/shared/Container'
import Loading from '@/components/shared/Loading'
import MediaSkeleton from '@/components/shared/loaders/MediaSkeleton'
import TextBlockSkeleton from '@/components/shared/loaders/TextBlockSkeleton'
import HelpBody from './components/HelpBody'
import { apiGetHelpTicketById } from '@/services/HelpService'
import type { HelpTicket, HelpReply } from '../ManageHelp/types'
import HelpReplyList from './components/HelpReplyList'
import HelpReplyForm from './components/HelpReplyForm'

const HelpDetails = () => {
    const { id } = useParams()

    const {
        data,
        isLoading,
        error,
    } = useSWR(
        id ? `/api/helps/ticket/${id}` : null, // ✅ CORREGIDO
        () => apiGetHelpTicketById<HelpTicket>(id!),
        {
            revalidateOnFocus: false,
        }
    )

    const [replies, setReplies] = useState<HelpReply[]>([])

    useEffect(() => {
        if (data?.replies) {
            setReplies(data.replies)
        }
    }, [data])

    const handleReplySubmit = (msg: string) => {
        const newReply: HelpReply = {
            author: 'You',
            message: msg,
            date: new Date().toLocaleString(),
        }
        setReplies((prev) => [...prev, newReply])
    }

    return (
        <Container>
            <div className="lg:flex gap-4">
                <div className="my-6 max-w-[800px] w-full mx-auto">
                    <Loading
                        loading={isLoading}
                        customLoader={
                            <div className="flex flex-col gap-8">
                                <MediaSkeleton />
                                <TextBlockSkeleton rowCount={6} />
                                <TextBlockSkeleton rowCount={4} />
                                <TextBlockSkeleton rowCount={8} />
                            </div>
                        }
                    >
                        {error && (
                            <div className="text-center text-red-500 font-medium">
                                Failed to load ticket.
                            </div>
                        )}

                        {data && (
                            <>
                                <HelpBody data={data} />

                                <div className="mt-10">
                                    <h4 className="mb-2 text-base font-semibold">Replies</h4>
                                    <HelpReplyList replies={replies} />
                                </div>

                                <div className="mt-10">
                                    <HelpReplyForm onSubmit={handleReplySubmit} />
                                </div>
                            </>
                        )}
                    </Loading>
                </div>
            </div>
        </Container>
    )
}

export default HelpDetails
