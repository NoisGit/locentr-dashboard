// src/views/concepts/condos/CondosList/components/CondosListTable.tsx
import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useCondosList from '../hooks/useCondosList'
import { Link, useNavigate } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb' // 👈 quitado TbEye
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Condo } from '../types'
import type { TableQueries } from '@/@types/common'

const NameColumn = ({ row }: { row: Condo }) => {
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={(row as any).img || ''} />
      <Link
        className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
        to={`/concepts/condos/condos-details/${row.id}`}
      >
        {String((row as any).name ?? '')}
      </Link>
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
      {/* 👇 Botón de "ver" eliminado */}
    </div>
  )
}

const CondosListTable = () => {
  const navigate = useNavigate()

  const {
    condosList,
    condosListTotal,
    tableData,
    isLoading,
    setTableData,
    setSelectAllCondos,
    setSelectedCondos,
    selectedCondos,
  } = useCondosList()

  const handleEdit = (condo: Condo) => {
    navigate(`/concepts/condos/condos-edit/${condo.id}`)
  }

  // 👇 quitado: handleViewDetails (ya no se usa)

  const columns: ColumnDef<Condo>[] = useMemo(
    () => [
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: (props) => <NameColumn row={props.row.original} />,
      },
      {
        header: 'Dirección',
        accessorKey: 'address',
        cell: (props) => <span>{String((props.row.original as any).address ?? '')}</span>,
      },
      {
        header: 'Tipo',
        accessorKey: 'type',
        cell: (props) => <span>{String((props.row.original as any).type ?? '')}</span>,
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn
            onEdit={() => handleEdit(props.row.original)}
          />
        ),
      },
    ],
    []
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    if (selectedCondos.length > 0) {
      setSelectAllCondos([])
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

  const handleRowSelect = (checked: boolean, row: Condo) => {
    if (checked) {
      setSelectedCondos([...selectedCondos, row])
    } else {
      setSelectedCondos(selectedCondos.filter((c) => c.id !== row.id))
    }
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Condo>[]) => {
    if (checked) {
      const originalRows = rows.map((row) => row.original)
      setSelectAllCondos(originalRows)
    } else {
      setSelectAllCondos([])
    }
  }

  return (
    <DataTable
      selectable
      columns={columns}
      data={condosList}
      noData={!isLoading && condosList.length === 0}
      skeletonAvatarColumns={[0]}
      skeletonAvatarProps={{ width: 28, height: 28 }}
      loading={isLoading}
      pagingData={{
        total: condosListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) =>
        selectedCondos.some((selected) => selected.id === row.id)
      }
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default CondosListTable
