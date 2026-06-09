import { useMemo, useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable from '@/components/shared/DataTable'
import useSupportTicketsList from './useSupportTicketsList'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { SupportTicket } from '@/services/SupportTicketsService'

const statusLabel: Record<string, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En progreso',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
    CANCELED: 'Cancelado',
}

function formatTicketDate(value?: string) {
    if (!value) return 'Sin fecha'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Sin fecha'

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date)
}

const SupportTicketsList = () => {
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { data, isLoading } = useSupportTicketsList({ pageIndex, pageSize })
    const tickets = useMemo(() => data?.items ?? data?.list ?? [], [data?.items, data?.list])
    const total = data?.total ?? 0

    const columns: ColumnDef<SupportTicket>[] = useMemo(
        () => [
            {
                header: 'Ticket',
                accessorKey: 'title',
                cell: (props) => {
                    const ticket = props.row.original
                    return (
                        <div className="min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {ticket.title || `Ticket #${ticket.id}`}
                            </div>
                            <div className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                {ticket.description || 'Sin descripción'}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Estado',
                accessorKey: 'status',
                cell: (props) => statusLabel[props.row.original.status] ?? 'Sin estado',
            },
            {
                header: 'Fecha',
                accessorKey: 'created_at',
                cell: (props) => formatTicketDate(props.row.original.created_at),
            },
        ],
        [],
    )

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handlePageSizeChange = (value: number) => {
        setPageSize(Number(value))
        setPageIndex(1)
    }

    return (
        <Container>
            <div className="flex flex-col gap-4">
                <div>
                    <h3>Tickets de soporte</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Revisa y gestiona solicitudes de soporte de Locentr.
                    </p>
                </div>

                <AdaptiveCard>
                    <DataTable
                        columns={columns}
                        data={tickets}
                        noData={!isLoading && tickets.length === 0}
                        loading={isLoading}
                        pagingData={{
                            total,
                            pageIndex,
                            pageSize,
                        }}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handlePageSizeChange}
                    />
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default SupportTicketsList
