import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { formatAuditLogDate, normalizeAuditLabel } from '../utils'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { AuditLogEntry } from '@/services/AuditLogService'

type AuditLogListProps = {
    entries: AuditLogEntry[]
    isLoading: boolean
    total: number
    pageIndex: number
    pageSize: number
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
}

const AuditLogList = ({
    entries,
    isLoading,
    total,
    pageIndex,
    pageSize,
    onPaginationChange,
    onSelectChange,
}: AuditLogListProps) => {
    const columns: ColumnDef<AuditLogEntry>[] = useMemo(
        () => [
            {
                header: 'Acción',
                accessorKey: 'action',
                cell: (props) => (
                    <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {normalizeAuditLabel(props.row.original.action)}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                            {props.row.original.description || 'Sin descripción'}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Tabla',
                accessorKey: 'table_name',
                cell: (props) => normalizeAuditLabel(props.row.original.table_name || 'Sin tabla'),
            },
            {
                header: 'Usuario',
                accessorKey: 'user_name',
                cell: (props) => props.row.original.user_name || 'Desconocido',
            },
            {
                header: 'Fecha',
                accessorKey: 'created_at',
                cell: (props) => formatAuditLogDate(props.row.original.created_at),
            },
        ],
        [],
    )

    return (
        <DataTable
            columns={columns}
            data={entries}
            noData={!isLoading && entries.length === 0}
            loading={isLoading}
            pagingData={{ total, pageIndex, pageSize }}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default AuditLogList
