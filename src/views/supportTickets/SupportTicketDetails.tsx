import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Container from '@/components/shared/Container'
import EmptyState from '@/components/shared/EmptyState'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import {
    apiCreateSupportTicketComment,
    apiGetSupportTicketById,
    apiListSupportTicketComments,
    type SupportTicketComment,
    type SupportTicketCommentsResponse,
} from '@/services/SupportTicketsService'
import { normalizeUserInput } from '@/utils/security/input'
import { getApiErrorMessage } from '@/utils/apiError'
import { TbArrowLeft, TbMessageCircle, TbSend } from 'react-icons/tb'

const statusLabel: Record<string, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En progreso',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
    CANCELED: 'Cancelado',
}

function formatDate(value?: string) {
    if (!value) return 'Sin fecha'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Sin fecha'

    return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

function getComments(data?: SupportTicketCommentsResponse) {
    if (Array.isArray(data)) return data
    return data?.items ?? data?.list ?? []
}

const SupportTicketDetails = () => {
    const { ticketId = '' } = useParams()
    const navigate = useNavigate()
    const currentUser = useSessionUser((state) => state.user)
    const [reply, setReply] = useState('')
    const [isSending, setIsSending] = useState(false)

    const {
        data: ticket,
        error: ticketError,
        isLoading: ticketLoading,
    } = useSWR(
        ticketId ? ['support-ticket:detail', ticketId] : null,
        ([, currentTicketId]) => apiGetSupportTicketById(currentTicketId),
        { revalidateOnFocus: false },
    )
    const {
        data: commentsData,
        error: commentsError,
        isLoading: commentsLoading,
        mutate: mutateComments,
    } = useSWR(
        ticketId ? ['support-ticket:comments', ticketId] : null,
        ([, currentTicketId]) => apiListSupportTicketComments(currentTicketId),
        { revalidateOnFocus: false },
    )

    const comments = useMemo(
        () =>
            getComments(commentsData)
                .slice()
                .sort((left, right) => {
                    return (
                        new Date(left.created_at).getTime() -
                        new Date(right.created_at).getTime()
                    )
                }),
        [commentsData],
    )
    const currentUserId = String(currentUser.id ?? currentUser.userId ?? '')
    const isClosed =
        ticket?.status === 'CLOSED' || ticket?.status === 'CANCELED'

    const handleReply = async () => {
        const content = normalizeUserInput(reply, 2000)
        if (!content || !ticketId) return

        try {
            setIsSending(true)
            await apiCreateSupportTicketComment(ticketId, { content })
            setReply('')
            await mutateComments()
            toast.push(
                <Notification type="success">Respuesta enviada.</Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(
                        error,
                        'No fue posible enviar la respuesta.',
                    )}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSending(false)
        }
    }

    if (ticketError) {
        return (
            <Container>
                <EmptyState
                    title="No fue posible abrir el ticket"
                    description="La solicitud no está disponible o no tienes acceso para verla."
                    actionLabel="Volver a tickets"
                    onAction={() => navigate('/tickets')}
                />
            </Container>
        )
    }

    return (
        <Container>
            <Loading loading={ticketLoading}>
                <div className="flex flex-col gap-6">
                    <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                            <button
                                type="button"
                                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                                onClick={() => navigate('/tickets')}
                            >
                                <TbArrowLeft />
                                Volver a tickets
                            </button>
                            <h2 className="break-words">
                                {ticket?.title || 'Solicitud de soporte'}
                            </h2>
                            <p className="mt-2 max-w-3xl whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                                {ticket?.description ||
                                    'Sin descripción disponible.'}
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-start gap-1 md:items-end">
                            <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary">
                                {statusLabel[ticket?.status || ''] ||
                                    'Sin estado'}
                            </span>
                            <span className="text-xs text-gray-400">
                                Creado {formatDate(ticket?.created_at)}
                            </span>
                        </div>
                    </header>

                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <TbMessageCircle className="text-xl text-primary" />
                            <div>
                                <h4>Seguimiento</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Historial de respuestas de la solicitud.
                                </p>
                            </div>
                        </div>

                        <Loading loading={commentsLoading}>
                            {commentsError ? (
                                <p className="border-y border-gray-200 py-5 text-sm text-red-600 dark:border-gray-800 dark:text-red-400">
                                    No fue posible cargar las respuestas.
                                </p>
                            ) : null}
                            {!commentsError && comments.length === 0 ? (
                                <EmptyState
                                    compact
                                    title="Aún no hay respuestas"
                                    description="La primera respuesta quedará registrada en este historial."
                                />
                            ) : null}
                            <div className="flex flex-col gap-3">
                                {comments.map(
                                    (comment: SupportTicketComment) => {
                                        const isOwn =
                                            currentUserId &&
                                            String(comment.created_by) ===
                                                currentUserId

                                        return (
                                            <article
                                                key={comment.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[min(720px,92%)] rounded-2xl px-4 py-3 ${
                                                        isOwn
                                                            ? 'rounded-br-md bg-primary text-white'
                                                            : 'rounded-bl-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    <div
                                                        className={`mb-1 text-xs font-semibold ${
                                                            isOwn
                                                                ? 'text-white/75'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {isOwn
                                                            ? 'Tú'
                                                            : 'Equipo de soporte'}
                                                    </div>
                                                    <p className="whitespace-pre-wrap break-words">
                                                        {comment.content}
                                                    </p>
                                                    <div
                                                        className={`mt-2 text-[11px] ${
                                                            isOwn
                                                                ? 'text-white/65'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {formatDate(
                                                            comment.created_at,
                                                        )}
                                                        {comment.edited_at
                                                            ? ' · Editado'
                                                            : ''}
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    },
                                )}
                            </div>
                        </Loading>
                    </section>

                    <section className="sticky bottom-3 border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 sm:rounded-2xl">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <Input
                                textArea
                                rows={3}
                                className="min-h-[88px] flex-1 resize-none"
                                disabled={isClosed}
                                maxLength={2000}
                                placeholder={
                                    isClosed
                                        ? 'Este ticket ya no admite respuestas'
                                        : 'Escribe una respuesta clara y detallada'
                                }
                                value={reply}
                                onChange={(event) =>
                                    setReply(event.target.value)
                                }
                            />
                            <Button
                                variant="solid"
                                icon={<TbSend />}
                                loading={isSending}
                                disabled={isClosed || !reply.trim()}
                                onClick={handleReply}
                            >
                                Responder
                            </Button>
                        </div>
                        <div className="mt-2 text-right text-xs text-gray-400">
                            {reply.length}/2000
                        </div>
                    </section>
                </div>
            </Loading>
        </Container>
    )
}

export default SupportTicketDetails
