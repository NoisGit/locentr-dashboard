// src/views/concepts/properties/PropertiesList/components/PropertiesListTable.tsx
import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import usePropertiesList from '../hooks/usePropertiesList'
import { Link, useNavigate } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Property } from '../types'
import type { TableQueries } from '@/@types/common'

const NumberColumn = ({ row }: { row: Property }) => {
  const display =
    (row as any).propertyNumber ??
    (row as any).number ??
    (row as any).property_number ??
    ''
  const title = display ? `Propiedad ${display}` : 'Propiedad'
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={(row as any).img || ''} />
      <Link
        className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
        to={`/concepts/properties/properties-details/${row.id}`}
      >
        {title}
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
    </div>
  )
}

const PropertiesListTable = () => {
  const navigate = useNavigate()

  const {
    propertiesList,
    propertiesListTotal,
    tableData,
    isLoading,
    setTableData,
    setSelectAllProperties,
    setSelectedProperties,
    selectedProperties,
  } = usePropertiesList()

  const handleEdit = (property: Property) => {
    navigate(`/concepts/properties/properties-edit/${property.id}`)
  }

  const columns: ColumnDef<Property>[] = useMemo(
    () => [
      {
        header: 'Propiedad',
        accessorKey: 'propertyNumber',
        cell: (props) => <NumberColumn row={props.row.original} />,
      },
      {
        header: 'Piso',
        accessorKey: 'floor',
        cell: (props) => {
          const f =
            (props.row.original as any).floor ??
            (props.row.original as any).level ??
            ''
          return <span>{String(f ?? '')}</span>
        },
      },
      {
        header: 'Comunidad',
        accessorKey: 'communityName',
        cell: (props) => {
          const r = props.row.original as any
          const name =
            r.communityName ??
            r.community?.name ??
            r.community_name ??
            r.tower ??
            ''
          return <span>{String(name ?? '')}</span>
        },
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
    if (selectedProperties.length > 0) {
      setSelectAllProperties([])
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

  const handleRowSelect = (checked: boolean, row: Property) => {
    if (checked) {
      setSelectedProperties([...selectedProperties, row])
    } else {
      setSelectedProperties(selectedProperties.filter((c) => c.id !== row.id))
    }
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Property>[]) => {
    if (checked) {
      const originalRows = rows.map((row) => row.original)
      setSelectAllProperties(originalRows)
    } else {
      setSelectAllProperties([])
    }
  }

  return (
    <DataTable
      selectable
      columns={columns}
      data={propertiesList}
      noData={!isLoading && propertiesList.length === 0}
      skeletonAvatarColumns={[0]}
      skeletonAvatarProps={{ width: 28, height: 28 }}
      loading={isLoading}
      pagingData={{
        total: propertiesListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) =>
        selectedProperties.some((selected) => selected.id === row.id)
      }
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default PropertiesListTable
