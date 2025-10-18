// src/views/concepts/entries/EntryList/components/EntryListTable.tsx
import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useEntryList from '../hooks/useEntryList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbEye } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Entry } from '../types'
import type { TableQueries } from '@/@types/common'

const NameColumn = ({ row }: { row: Entry }) => {
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={row.img} />
      <Link
        className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
        to={`/concepts/entries/entry-details/${row.id}`}
      >
        {row.firstName} {row.lastName}
      </Link>
    </div>
  )
}

const ActionColumn = ({ onViewDetail }: { onViewDetail: () => void }) => {
  return (
    <div className="flex items-center gap-3">
      <Tooltip title="View details">
        <div
          className="text-xl cursor-pointer select-none font-semibold"
          role="button"
          onClick={onViewDetail}
        >
          <TbEye />
        </div>
      </Tooltip>
    </div>
  )
}

const EntryListTable = () => {
  const navigate = useNavigate()

  const {
    entryList,
    entryListTotal,
    tableData,
    isLoading,
    setTableData,
    setSelectAllEntry,
    setSelectedEntry,
    selectedEntry,
  } = useEntryList()

  const handleViewDetails = (entry: Entry) => {
    navigate(`/concepts/entries/entry-details/${entry.id}`)
  }

  const columns: ColumnDef<Entry>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'firstName',
        cell: (props) => <NameColumn row={props.row.original} />,
      },
      {
        header: 'RUT',
        accessorKey: 'rut',
      },
      {
        header: 'Department',
        accessorKey: 'departamentoVisitado',
      },
      {
        header: 'Date',
        accessorKey: 'fecha',
      },
      {
        header: 'Time',
        accessorKey: 'hora',
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn onViewDetail={() => handleViewDetails(props.row.original)} />
        ),
      },
    ],
    []
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    if (selectedEntry.length > 0) {
      setSelectAllEntry([])
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

  const handleRowSelect = (checked: boolean, row: Entry) => {
    setSelectedEntry(checked, row)
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Entry>[]) => {
    if (checked) {
      const originalRows = rows.map((row) => row.original)
      setSelectAllEntry(originalRows)
    } else {
      setSelectAllEntry([])
    }
  }

  return (
    <DataTable
      selectable
      columns={columns}
      data={entryList}
      noData={!isLoading && entryList.length === 0}
      skeletonAvatarColumns={[0]}
      skeletonAvatarProps={{ width: 28, height: 28 }}
      loading={isLoading}
      pagingData={{
        total: entryListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) =>
        selectedEntry.some((selected) => selected.id === row.id)
      }
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default EntryListTable
