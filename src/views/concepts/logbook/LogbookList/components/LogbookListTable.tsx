import { useMemo, useState } from 'react'
import DataTable from '@/components/shared/DataTable'
import useLogbookList from '../hooks/useLogbookList'
import { useLogbookListStore } from '../store/LogbookListStore'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef } from '@/components/shared/DataTable'
import type { LogbookRow } from '@/services/LogbookService'

function formatDateIsoLike(v: unknown): string {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!s) return ''
  return s.replace('T', ' ').replace(/Z$/, '').replace(/\.\d+$/, '')
}

function DescriptionCell({ text }: { text?: string }) {
  const [expanded, setExpanded] = useState(false)
  const raw = (text ?? '').trim()
  if (!raw) return <span>—</span>

  const LIMIT = 320
  const isLong = raw.length > LIMIT
  const display = expanded ? raw : isLong ? raw.slice(0, LIMIT) + '…' : raw

  return (
    <div
      className="whitespace-pre-line break-words"
      style={{ maxWidth: '78vw', width: 860 }}
    >
      {display}
      {isLong && (
        <button
          type="button"
          className="text-primary text-xs mt-1 hover:underline block"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}

const LogbookListTable = () => {
  const tableData = useLogbookListStore((s) => s.tableData)
  const setTableData = useLogbookListStore((s) => s.setTableData)
  const { logbookList, logbookListTotal, isLoading } = useLogbookList()

  const columns: ColumnDef<LogbookRow>[] = useMemo(
    () => [
      {
        header: 'Registro',
        accessorKey: 'id',
        cell: (props) => {
          const r = props.row.original
          const id = r?.id != null ? String(r.id) : ''
          return (
            <div className="font-bold heading-text whitespace-nowrap" style={{ width: 56 }}>
              #{id || '—'}
            </div>
          )
        },
      },
      {
        header: 'Descripción',
        id: 'description',
        cell: (props) => <DescriptionCell text={props.row.original.description} />,
      },
      {
        header: 'Autor',
        id: 'author',
        enableSorting: false,
        cell: (props) => {
          const r = props.row.original as any
          const name = r.user_name || r.created_by || ''
          return (
            <div className="truncate" style={{ width: 110 }}>
              {name || '—'}
            </div>
          )
        },
      },
      {
        // Evita que el texto del header se parta y que el icono quede abajo
        header: () => <span className="whitespace-nowrap">Fecha de creación</span>,
        id: 'created_at',
        accessorKey: 'created_at',
        cell: (props) => {
          const r = props.row.original as any
          const u = r.updated_at || r.updatedAt || r.created_at || r.createdAt
          const pretty = formatDateIsoLike(u)
          return (
            <div className="whitespace-nowrap" style={{ width: 138 }}>
              {pretty || '—'}
            </div>
          )
        },
      },
    ],
    []
  )

  const handleSetTableData = (data: TableQueries) => setTableData(data)

  const handlePaginationChange = (page: number) => {
    const next = structuredClone(tableData)
    next.pageIndex = page
    handleSetTableData(next)
  }

  const handleSelectChange = (value: number) => {
    const next = structuredClone(tableData)
    next.pageSize = Number(value)
    next.pageIndex = 1
    handleSetTableData(next)
  }

  const handleSort = (sort: OnSortParam) => {
    const next = structuredClone(tableData)
    next.sort = sort
    handleSetTableData(next)
  }

  return (
    <DataTable
      hoverable={false}
      columns={columns}
      data={logbookList}
      noData={!isLoading && logbookList.length === 0}
      skeletonAvatarColumns={[]}
      loading={isLoading}
      pagingData={{
        total: logbookListTotal || 0,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
    />
  )
}

export default LogbookListTable
