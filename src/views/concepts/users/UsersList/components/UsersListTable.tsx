import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import useCustomerList from '@/views/concepts/customers/CustomerList/hooks/useCustomerList'
import { useNavigate } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import { getCoredeckRoleLabel } from '@/utils/rbac'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Customer } from '@/views/concepts/customers/CustomerList/types'
import type { TableQueries } from '@/@types/common'

const NameColumn = ({ row }: { row: Customer }) => {
  const avatarSrc = (row as any).avatar || (row as any).avatar_url || (row as any).img || ''
  const displayName =
    (row as any).name ||
    (row as any).full_name ||
    [ (row as any).first_name, (row as any).last_name ].filter(Boolean).join(' ') ||
    ''
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={avatarSrc} />
      <span className="ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100">
        {displayName}
      </span>
    </div>
  )
}

function roleDisplay(row: Customer): string {
  const raw =
    typeof (row as any).role === 'string'
      ? (row as any).role
      : (row as any).role?.name ?? (row as any).role_name ?? ''

  return getCoredeckRoleLabel(raw) || raw || ''
}

const ActionColumn = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-xl cursor-pointer select-none font-semibold"
        role="button"
        onClick={onEdit}
        title="Editar"
      >
        <TbPencil />
      </div>
    </div>
  )
}

const UsersListTable = () => {
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

  const handleEdit = (user: Customer) => {
    navigate(`/concepts/users/users-edit/${user.id}`)
  }

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: (props) => <NameColumn row={props.row.original} />,
      },
      {
        header: 'Correo',
        accessorKey: 'email',
        cell: (props) => <span>{String((props.row.original as any).email ?? '')}</span>,
      },
      {
        header: 'Teléfono',
        accessorKey: 'phone',
        cell: (props) => <span>{String((props.row.original as any).phone ?? (props.row.original as any).phone_number ?? '')}</span>,
      },
      {
        header: 'Rol',
        accessorKey: 'role',
        cell: (props) => <span>{roleDisplay(props.row.original)}</span>,
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

export default UsersListTable
