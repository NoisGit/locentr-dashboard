// src/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListTable.tsx
import { useEffect, useMemo } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { Link, useNavigate } from 'react-router-dom'
import { TbPencil } from 'react-icons/tb'
import cloneDeep from 'lodash/cloneDeep'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import useAccessPointsList from '../hooks/useAccessPointsList'
import type { AccessPoint } from '../store/AccessPointsListStore'

function toText(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function dash(v: unknown): string {
  const s = toText(v).trim()
  return s ? s : '—'
}

const ActionColumn = ({ onEdit }: { onEdit: () => void }) => (
  <div className="flex items-center gap-3">
    <Tooltip title="Editar">
      <div
        className="text-xl cursor-pointer select-none font-semibold"
        role="button"
        onClick={onEdit}
      >
        <TbPencil />
      </div>
    </Tooltip>
  </div>
)

const AccessPointsListTable = () => {
  const navigate = useNavigate()

  const {
    list,
    total,
    tableData,
    isLoading,
    setTableData,
    setSelectAllAccessPoints,
    setSelectedAccessPoints,
    selectedAccessPoints = [],
    mutate,
  } = useAccessPointsList()

  // Revalidar cuando se notifiquen cambios (crear/editar/eliminar)
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('accesspoints:changed', handler as EventListener)
    return () => window.removeEventListener('accesspoints:changed', handler as EventListener)
  }, [mutate])

  // Columnas: Nombre (link), Rol (texto), Acción (lápiz)
  const columns: ColumnDef<AccessPoint>[] = useMemo(
    () => [
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: (p) => {
          const id = String(p.row.original.id ?? '')
          const full = toText((p.row.original as any).full_name)
          const name = full || toText(p.row.original.name) || `ID ${id}`
          return (
            <div className="flex items-center">
              <Link
                className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100 max-w-[28rem] truncate"
                to={`/concepts/accesspoints/accesspoints-edit/${id}`}
                title={name}
              >
                {name}
              </Link>
            </div>
          )
        },
      },
      {
        header: 'Rol',
        accessorKey: 'role',
        cell: (p) => (
          <span className="text-gray-700 dark:text-gray-300">
            {dash(p.row.original.role)}
          </span>
        ),
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn
            onEdit={() =>
              navigate(`/concepts/accesspoints/accesspoints-edit/${String(props.row.original.id)}`)
            }
          />
        ),
      },
    ],
    [navigate],
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    setSelectAllAccessPoints([])
  }

  // 1-based como en tu DataTable/Pagination
  const handlePaginationChange = (page: number) => {
    const next = cloneDeep(tableData)
    const target = Math.max(1, Number(page))
    if (target === Number(next.pageIndex ?? 1)) return
    next.pageIndex = target
    handleSetTableData(next)
  }

  const handleSelectChange = (value: number) => {
    const next = cloneDeep(tableData)
    next.pageSize = Number(value)
    next.pageIndex = 1
    handleSetTableData(next)
  }

  const handleSort = (sort: OnSortParam) => {
    const next = cloneDeep(tableData)
    next.sort = sort
    handleSetTableData(next)
  }

  const handleRowSelect = (checked: boolean, row: AccessPoint) => {
    const current = selectedAccessPoints ?? []
    if (checked) setSelectedAccessPoints([...current, row])
    else setSelectedAccessPoints(current.filter((c) => c.id !== row.id))
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<AccessPoint>[]) => {
    if (checked) setSelectAllAccessPoints(rows.map((r) => r.original))
    else setSelectAllAccessPoints([])
  }

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={list}
        loading={isLoading}
        noData={!isLoading && list.length === 0}
        pagingData={{
          total: Number(total) || 0,
          pageIndex: tableData.pageIndex as number, // 1-based
          pageSize: tableData.pageSize as number,
        }}
        selectable
        checkboxChecked={(row) => (selectedAccessPoints ?? []).some((s) => s.id === row.id)}
        onPaginationChange={handlePaginationChange}
        onSelectChange={handleSelectChange}
        onSort={handleSort}
        onCheckBoxChange={handleRowSelect}
        onIndeterminateCheckBoxChange={handleAllRowSelect}
        skeletonAvatarColumns={[]}
      />
    </div>
  )
}

export default AccessPointsListTable
