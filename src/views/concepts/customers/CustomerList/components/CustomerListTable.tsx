import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import useCustomerList from '../hooks/useCustomerList'
import { Link, useNavigate } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Customer } from '../types'
import type { TableQueries } from '@/@types/common'

const NameColumn = ({ row }: { row: Customer }) => {
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={row.avatar || ''} />
      <Link
        className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
        to={`/concepts/users/users-edit/${row.id}`}
      >
        {row.name}
      </Link>
    </div>
  )
}

const ActionColumn = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-xl cursor-pointer select-none font-semibold"
        role="button"
        onClick={onEdit}
        title="Edit"
      >
        <TbPencil />
      </div>
    </div>
  )
}

const CustomerListTable = () => {
  const navigate = useNavigate()

  const {
    customerList,
    customerListTotal,
    tableData,
    isLoading,
    setTableData,
    setSelectAllCustomer,
    setSelectedCustomer,
    selectedCustomer,
  } = useCustomerList()

  const handleEdit = (customer: Customer) => {
    navigate(`/concepts/users/users-edit/${customer.id}`)
  }

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: (props) => <NameColumn row={props.row.original} />,
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
      },
      {
        header: 'Role',
        accessorKey: 'role',
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn onEdit={() => handleEdit(props.row.original)} />
        ),
      },
    ],
    [],
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    if (selectedCustomer.length > 0) {
      setSelectAllCustomer([])
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

  const handleRowSelect = (checked: boolean, row: Customer) => {
    setSelectedCustomer(checked, row)
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Customer>[]) => {
    if (checked) {
      const originalRows = rows.map((row) => row.original)
      setSelectAllCustomer(originalRows)
    } else {
      setSelectAllCustomer([])
    }
  }

  return (
    <DataTable
      selectable
      columns={columns}
      data={customerList}
      noData={!isLoading && customerList.length === 0}
      skeletonAvatarColumns={[0]}
      skeletonAvatarProps={{ width: 28, height: 28 }}
      loading={isLoading}
      pagingData={{
        total: customerListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) =>
        selectedCustomer.some((selected) => selected.id === row.id)
      }
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default CustomerListTable
