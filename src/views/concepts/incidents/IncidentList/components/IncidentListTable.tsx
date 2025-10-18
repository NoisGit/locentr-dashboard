import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Link } from 'react-router-dom'
import useIncidentList from '../hooks/useIncidentList'
import { useIncidentListStore } from '../store/IncidentListStore'
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'
import type { IncidentRow } from '../types'

type Props = {
  statusIn: Array<'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED' | string>
  section: 'active' | 'resolved'
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN PROGRESS',
  CLOSED: 'CLOSED',
  RESOLVED: 'COMPLETED',
}

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

const IdColumn = ({ row }: { row: IncidentRow }) => (
  <div className="flex items-center">
    <Link
      to={`/concepts/incidents/${row.id}`}
      className="hover:text-primary font-semibold text-gray-900 dark:text-gray-100"
    >
      #{row.id}
    </Link>
  </div>
)

const TitleColumn = ({ row }: { row: IncidentRow }) => (
  <Link
    to={`/concepts/incidents/${row.id}`}
    className="hover:text-primary font-semibold text-gray-900 dark:text-gray-100"
  >
    {row.title}
  </Link>
)

const StatusColumn = ({ row }: { row: IncidentRow }) => {
  const raw = String(row.status ?? '').toUpperCase()
  const txt = STATUS_LABEL[raw] ?? (raw || '—')
  return <span>{txt}</span>
}

const PriorityColumn = ({ row }: { row: IncidentRow }) => {
  const raw = String(row.priority ?? '').toUpperCase()
  const txt = PRIORITY_LABEL[raw] ?? (raw ? String(raw) : '—')
  return <span>{txt}</span>
}

const PropertyColumn = ({ row }: { row: IncidentRow }) => {
  const code =
    row.property_code ??
    (row as unknown as Record<string, unknown>)['propertyCode'] ??
    (row as unknown as Record<string, unknown>)['property_number'] ??
    ''
  return <span>{String(code || '—')}</span>
}

const DateColumn = ({ row }: { row: IncidentRow }) => (
  <span className="whitespace-nowrap">
    {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
  </span>
)

/** Mapea el sort de la tabla al tipo del store */
function mapSort(
  s: OnSortParam | undefined
): { key?: string; order?: 'asc' | 'desc' } | undefined {
  if (!s) return undefined
  const order = s.order === 'asc' || s.order === 'desc' ? s.order : undefined
  const key =
    typeof s.key === 'string'
      ? s.key
      : typeof s.key === 'number'
      ? String(s.key)
      : undefined
  if (!key && !order) return undefined
  return { key, order }
}

const IncidentListTable = ({ statusIn, section }: Props) => {
  const { loading, items, total, tableData, actions } = useIncidentList({ statusIn, section })

  const setTable =
    section === 'active'
      ? useIncidentListStore((s) => s.setActiveTableData)
      : useIncidentListStore((s) => s.setResolvedTableData)

  const columns: ColumnDef<IncidentRow>[] = useMemo(
    () => [
      { header: '#', accessorKey: 'id', enableSorting: true, cell: (p) => <IdColumn row={p.row.original} /> },
      { header: 'Título', accessorKey: 'title', enableSorting: true, cell: (p) => <TitleColumn row={p.row.original} /> },
      { header: 'Estado', accessorKey: 'status', cell: (p) => <StatusColumn row={p.row.original} /> },
      { header: 'Prioridad', accessorKey: 'priority', cell: (p) => <PriorityColumn row={p.row.original} /> },
      { header: '# Propiedad', accessorKey: 'property_code', cell: (p) => <PropertyColumn row={p.row.original} /> },
      { header: 'Fecha de creación', accessorKey: 'created_at', enableSorting: true, cell: (p) => <DateColumn row={p.row.original} /> },
    ],
    [],
  )

  const handlePaginationChange = (page: number) => {
    setTable({ ...tableData, pageIndex: page })
    actions.mutate()
  }

  const handleSelectChange = (value: number) => {
    const pageSize = Number(value)
    setTable({ ...tableData, pageSize, pageIndex: 1 })
    actions.mutate()
  }

  const handleSort = (sort: OnSortParam) => {
    setTable({ ...tableData, sort: mapSort(sort) })
    actions.mutate()
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      noData={!loading && items.length === 0}
      loading={loading}
      pagingData={{
        total,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
    />
  )
}

export default IncidentListTable
