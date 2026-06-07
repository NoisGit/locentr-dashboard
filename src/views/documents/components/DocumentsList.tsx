import { useMemo } from 'react'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import { formatDocumentDate, formatFileSize } from '../utils'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { DocumentResponse } from '@/services/DocumentsService'

type DocumentsListProps = {
    documents: DocumentResponse[]
    isLoading: boolean
    total: number
    pageIndex: number
    pageSize: number
    onDownload: (documentId: number) => void
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
}

const DocumentsList = ({
    documents,
    isLoading,
    total,
    pageIndex,
    pageSize,
    onDownload,
    onPaginationChange,
    onSelectChange,
}: DocumentsListProps) => {
    const columns: ColumnDef<DocumentResponse>[] = useMemo(
        () => [
            {
                header: 'Nombre',
                accessorKey: 'name',
                cell: (props) => (
                    <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {props.row.original.name || 'Documento sin nombre'}
                        </div>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {props.row.original.file_name || 'Sin archivo'}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Tamaño',
                accessorKey: 'size_bytes',
                cell: (props) => formatFileSize(props.row.original.size_bytes),
            },
            {
                header: 'Fecha',
                accessorKey: 'created_at',
                cell: (props) => formatDocumentDate(props.row.original.created_at),
            },
            {
                header: 'Comentario',
                accessorKey: 'comment',
                cell: (props) => (
                    <span className="line-clamp-2">
                        {props.row.original.comment || 'Sin comentario'}
                    </span>
                ),
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => onDownload(props.row.original.id)}
                        >
                            Descargar
                        </Button>
                    </div>
                ),
            },
        ],
        [onDownload],
    )

    return (
        <DataTable
            columns={columns}
            data={documents}
            noData={!isLoading && documents.length === 0}
            loading={isLoading}
            pagingData={{ total, pageIndex, pageSize }}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default DocumentsList
