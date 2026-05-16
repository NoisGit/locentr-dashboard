import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import Tooltip from '@/components/ui/Tooltip'
import cloneDeep from 'lodash/cloneDeep'
import { Link, useNavigate } from 'react-router-dom'
import { TbPencil } from 'react-icons/tb'
import useWorkspacesList from '../hooks/useWorkspacesList'
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import type { Workspace } from '../types'

const NameColumn = ({ row }: { row: Workspace }) => {
  return (
    <Link
      className="hover:text-primary font-semibold text-gray-900 dark:text-gray-100"
      to={`/concepts/workspaces/workspaces-details/${row.id}`}
    >
      {row.name || 'Workspace sin nombre'}
    </Link>
  )
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

const WorkspacesListTable = () => {
  const navigate = useNavigate()

  const {
    workspacesList,
    workspacesListTotal,
    tableData,
    isLoading,
    setTableData,
  } = useWorkspacesList()

  const handleEdit = (workspace: Workspace) => {
    navigate(`/concepts/workspaces/workspaces-edit/${workspace.id}`)
  }

  const columns: ColumnDef<Workspace>[] = useMemo(
    () => [
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: (props) => <NameColumn row={props.row.original} />,
      },
      {
        header: 'Dirección',
        accessorKey: 'address',
        cell: (props) => <span>{props.row.original.address || 'Sin dirección'}</span>,
      },
      {
        header: 'País',
        accessorKey: 'country',
        cell: (props) => <span>{props.row.original.country || 'Sin país'}</span>,
      },
      {
        header: '',
        id: 'action',
        cell: (props) => <ActionColumn onEdit={() => handleEdit(props.row.original)} />,
      },
    ],
    [],
  )

  const handlePaginationChange = (page: number) => {
    const nextTableData = cloneDeep(tableData)
    nextTableData.pageIndex = page
    setTableData(nextTableData)
  }

  const handleSelectChange = (value: number) => {
    const nextTableData = cloneDeep(tableData)
    nextTableData.pageSize = Number(value)
    nextTableData.pageIndex = 1
    setTableData(nextTableData)
  }

  const handleSort = (sort: OnSortParam) => {
    const nextTableData = cloneDeep(tableData)
    nextTableData.sort = sort
    setTableData(nextTableData)
  }

  return (
    <DataTable
      columns={columns}
      data={workspacesList}
      noData={!isLoading && workspacesList.length === 0}
      loading={isLoading}
      pagingData={{
        total: workspacesListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
    />
  )
}

export default WorkspacesListTable
