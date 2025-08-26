// src/views/concepts/residents/ResidentsList/components/ResidentsListTable.tsx
import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { useNavigate } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import useResidentsList from '../hooks/useResidentsList'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Resident } from '../store/ResidentsListStore'
import type { TableQueries } from '@/@types/common'

const ResidentColumn = ({ row }: { row: Resident }) => {
  const name = String(row.userName || `ID ${row.id}`)
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={(row as any).img || ''} />
      <span className="ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100">
        {name}
      </span>
    </div>
  )
}

const ActionColumn = ({ onEdit }: { onEdit: () => void }) => {
  return (
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
}

const ResidentsListTable = () => {
  const navigate = useNavigate()

  const {
    residentsList,
    residentsListTotal,
    tableData,
    isLoading,
    setTableData,
    setSelectAllResidents,
    setSelectedResidents,
    selectedResidents,
  } = useResidentsList()

  const handleEdit = (resident: Resident) => {
    navigate(`/concepts/residents/residents-edit/${resident.id}`)
  }

  const columns: ColumnDef<Resident>[] = useMemo(
    () => [
      {
        header: 'Residente',
        accessorKey: 'userName',
        cell: (props) => <ResidentColumn row={props.row.original} />,
      },
      {
        header: 'Propiedad',
        accessorKey: 'propertyName',
        cell: (props) => (
          <span>{String((props.row.original as any).propertyName ?? '')}</span>
        ),
      },
      {
        header: 'Dueño',
        accessorKey: 'isOwner',
        cell: (props) => (
          <span>{(props.row.original as any).isOwner ? 'Sí' : 'No'}</span>
        ),
      },
      {
        header: 'Inicio',
        accessorKey: 'startDate',
        cell: (props) => (
          <span>{String((props.row.original as any).startDate ?? '')}</span>
        ),
      },
      {
        header: 'Fin',
        accessorKey: 'endDate',
        cell: (props) => (
          <span>{String((props.row.original as any).endDate ?? '-')}</span>
        ),
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn onEdit={() => handleEdit(props.row.original)} />
        ),
      },
    ],
    []
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    if (selectedResidents.length > 0) {
      setSelectAllResidents([])
    }
  }

  const handlePaginationChange = (page: number) => {
    const newTableData = cloneDeep(tableData)
    newTableData.pageIndex = page
    handleSetTableData(newTableData)
  }

  const handleSelectChange = (value: number) => {
    const newTableData = cloneDeep(tableData)
    newTableData.pageSize = Number(value)
    newTableData.pageIndex = 1
    handleSetTableData(newTableData)
  }

  const handleSort = (sort: OnSortParam) => {
    const newTableData = cloneDeep(tableData)
    newTableData.sort = sort
    handleSetTableData(newTableData)
  }

  const handleRowSelect = (checked: boolean, row: Resident) => {
    if (checked) {
      setSelectedResidents([...selectedResidents, row])
    } else {
      setSelectedResidents(selectedResidents.filter((r) => r.id !== row.id))
    }
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Resident>[]) => {
    if (checked) {
      const originalRows = rows.map((row) => row.original)
      setSelectAllResidents(originalRows)
    } else {
      setSelectAllResidents([])
    }
  }

  return (
    <DataTable
      selectable
      columns={columns}
      data={residentsList}
      noData={!isLoading && residentsList.length === 0}
      skeletonAvatarColumns={[0]}
      skeletonAvatarProps={{ width: 28, height: 28 }}
      loading={isLoading}
      pagingData={{
        total: residentsListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) =>
        selectedResidents.some((selected) => selected.id === row.id)
      }
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default ResidentsListTable
