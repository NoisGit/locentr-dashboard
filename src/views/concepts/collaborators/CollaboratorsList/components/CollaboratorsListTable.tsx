// src/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListTable.tsx
import { useEffect, useMemo } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import useCollaboratorsList from '../hooks/useCollaboratorsList'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import type { Collaborator } from '../store/CollaboratorsListStore'

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

const CollaboratorsListTable = () => {
  const navigate = useNavigate()

  const {
    list,
    total,
    tableData,
    filterData,
    isLoading,
    setTableData,
    setSelectAllCollaborators,
    setSelectedCollaborators,
    selectedCollaborators,
    mutate,
  } = useCollaboratorsList()

  const { selectedId: communityId } = useCommunitiesStore()

  // Refrescar lista cuando otros flujos disparen el evento (crear/editar/eliminar)
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('collaborators:changed', handler as EventListener)
    return () => window.removeEventListener('collaborators:changed', handler as EventListener)
  }, [mutate])

  // Ocultar SUPERADMIN en UI; no altera cómo se muestra el rol
  const safeList = useMemo(
    () => list.filter(r => (r.role || '').toUpperCase() !== 'SUPERADMIN'),
    [list],
  )

  const columns: ColumnDef<Collaborator>[] = useMemo(
    () => [
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: (p) => {
          const id = String(p.row.original.id ?? '')
          const name = toText(p.row.original.name) || (p.row.original.email ?? `ID ${id}`)
          return (
            <div className="flex items-center">
              <Link
                className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
                to={`/concepts/collaborators/collaborators-edit/${id}`}
              >
                {name}
              </Link>
            </div>
          )
        },
      },
      { header: 'Correo',   accessorKey: 'email', cell: (p) => <span>{dash(p.row.original.email)}</span> },
      { header: 'Teléfono', accessorKey: 'phone', cell: (p) => <span>{dash(p.row.original.phone)}</span> },
      // Rol se muestra EXACTO como viene del service (que ya respeta el JSON)
      { header: 'Rol',      accessorKey: 'role',  cell: (p) => <span>{dash(p.row.original.role)}</span> },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn
            onEdit={() => navigate(`/concepts/collaborators/collaborators-edit/${String(props.row.original.id)}`)}
          />
        ),
      },
    ],
    [navigate],
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    setSelectAllCollaborators([])
  }

  const handlePaginationChange = (page: number) => {
    const next = cloneDeep(tableData)
    next.pageIndex = page
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

  const handleRowSelect = (checked: boolean, row: Collaborator) => {
    if (checked) setSelectedCollaborators([...selectedCollaborators, row])
    else setSelectedCollaborators(selectedCollaborators.filter((c) => c.id !== row.id))
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Collaborator>[]) => {
    if (checked) setSelectAllCollaborators(rows.map((r) => r.original))
    else setSelectAllCollaborators([])
  }

  // Clave de remonte (incluye comunidad y filtros) para que el salto de página sea inmediato
  const tableKey = useMemo(() => {
    const sKey = tableData?.sort?.key ?? ''
    const sOrd = tableData?.sort?.order ?? ''
    const q = tableData?.query ?? ''
    const role = (filterData as Record<string, unknown>)?.['role'] ?? ''
    const act = (filterData as Record<string, unknown>)?.['active'] ?? ''
    const cid = String(communityId ?? '')
    return `${tableData.pageIndex}-${tableData.pageSize}-${sKey}-${sOrd}-${q}-${cid}-${role}-${act}`
  }, [tableData, filterData, communityId])

  return (
    <DataTable
      key={tableKey}
      columns={columns}
      data={safeList}
      loading={isLoading}
      noData={!isLoading && safeList.length === 0}
      pagingData={{
        total: Number(total) || 0,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      selectable
      checkboxChecked={(row) => selectedCollaborators.some((s) => s.id === row.id)}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
      skeletonAvatarColumns={[]}
    />
  )
}

export default CollaboratorsListTable
