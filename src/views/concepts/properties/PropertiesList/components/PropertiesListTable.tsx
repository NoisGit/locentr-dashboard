// src/views/concepts/properties/PropertiesList/components/PropertiesListTable.tsx
import { useEffect, useMemo } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import usePropertiesList from '../hooks/usePropertiesList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Property } from '../types'
import type { TableQueries } from '@/@types/common'

const NumberColumn = ({ row }: { row: Property }) => {
  const display =
    row.propertyNumber ??
    ((row as Record<string, unknown>)['number'] as string | undefined) ??
    ((row as Record<string, unknown>)['property_number'] as string | undefined) ??
    ''
  const title = display ? `# ${display}` : 'Propiedad'
  return (
    <div className="flex items-center">
      <Link
        className="hover:text-primary font-semibold text-gray-900 dark:text-gray-100"
        to={`/concepts/properties/properties-details/${row.id}`}
      >
        {title}
      </Link>
    </div>
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

const PropertiesListTable = () => {
  const navigate = useNavigate()

  const {
    propertiesList,
    propertiesListTotal,
    tableData,
    filterData,
    isLoading,
    setTableData,
    setSelectAllProperties,
    setSelectedProperties,
    selectedProperties,
    mutate,
  } = usePropertiesList()

  // 🔁 Refresca la tabla cuando ocurra un cambio externo (crear/eliminar) sin F5
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('properties:changed', handler as EventListener)
    return () => window.removeEventListener('properties:changed', handler as EventListener)
  }, [mutate])

  const selectedIdSet = useMemo(
    () => new Set(selectedProperties.map((p) => String(p.id))),
    [selectedProperties],
  )

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
            props.row.original.floor ??
            ((props.row.original as Record<string, unknown>)['level'] as number | string | undefined) ??
            ''
          return <span>{String(f ?? '')}</span>
        },
      },
      {
        header: 'Torre',
        accessorKey: 'block',
        cell: (props) => {
          const r = props.row.original as unknown as Record<string, unknown>
          const b =
            (r['block'] as string | undefined) ??
            (r['block_tower'] as string | undefined) ??
            (r['tower'] as string | undefined) ??
            (r['building'] as string | undefined) ??
            ''
          return <span>{String(b ?? '')}</span>
        },
      },
      {
        header: '',
        id: 'action',
        cell: (props) => <ActionColumn onEdit={() => handleEdit(props.row.original)} />,
      },
    ],
    [],
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
      /*  Forzamos re-montaje cuando cambian paginación/filtros para que el salto de página sea inmediato */
      key={`${tableData.pageIndex}-${tableData.pageSize}-${tableData.sort?.key ?? ''}-${tableData.sort?.order ?? ''}-${tableData.query ?? ''}-${filterData.communityId ?? ''}`}
      selectable
      columns={columns}
      data={propertiesList}
      noData={!isLoading && propertiesList.length === 0}
      loading={isLoading}
      pagingData={{
        total: propertiesListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) => selectedIdSet.has(String(row.id))}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default PropertiesListTable
