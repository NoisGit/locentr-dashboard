import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import useSupportTicketsList from './useSupportTicketsList'

const SupportTicketsList = () => {
    const { tickets, isLoading } = useSupportTicketsList()

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div>
                        <h3>Support tickets</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage Coredeck support tickets.
                        </p>
                    </div>

                    {isLoading ? (
                        <p>Loading...</p>
                    ) : tickets.length === 0 ? (
                        <p>No support tickets found.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="font-semibold">
                                        {ticket.subject || ticket.title || `Ticket #${ticket.id}`}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {ticket.status || 'unknown'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default SupportTicketsList
