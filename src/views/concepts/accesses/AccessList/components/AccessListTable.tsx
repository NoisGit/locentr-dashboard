import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useAccessList from '../hooks/useAccessList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbEye } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Access } from '../types'
import type { TableQueries } from '@/@types/common'

const NameColumn = ({ row }: { row: Access }) => {
    return (
        <div className="flex items-center">
            <Avatar size={40} shape="circle" src={row.img} />
            <Link
                className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
                to={`/concepts/accesses/access-details/${row.id}`}
            >
                {row.firstName} {row.lastName}
            </Link>
        </div>
    )
}


const ActionColumn = ({
    onEdit,
    onViewDetail,
}: {
    onEdit: () => void
    onViewDetail: () => void
}) => {
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
            <Tooltip title="Ver detalles">
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

const AccessListTable = () => {
    const navigate = useNavigate()

    const {
        accessList,
        accessListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllAccess,
        setSelectedAccess,
        selectedAccess,
    } = useAccessList()

    const handleEdit = (access: Access) => {
        navigate(`/concepts/accesses/access-edit/${access.id}`)
    }

    const handleViewDetails = (access: Access) => {
        navigate(`/concepts/accesses/access-details/${access.id}`)
    }

    const columns: ColumnDef<Access>[] = useMemo(
        () => [
            {
                header: 'Nombre',
                accessorKey: 'firstName',
                cell: (props) => <NameColumn row={props.row.original} />,
            },
            {
                header: 'RUT',
                accessorKey: 'rut',
            },
            {
                header: 'Departamento',
                accessorKey: 'departamentoVisitado',
            },
            {
                header: 'Fecha',
                accessorKey: 'fecha',
            },
            {
                header: 'Hora',
                accessorKey: 'hora',
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onViewDetail={() => handleViewDetails(props.row.original)}
                    />
                ),
            },
        ],
        [],
    )

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedAccess.length > 0) {
            setSelectAllAccess([])
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

    const handleRowSelect = (checked: boolean, row: Access) => {
        setSelectedAccess(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<Access>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllAccess(originalRows)
        } else {
            setSelectAllAccess([])
        }
    }

    return (
        <DataTable
            selectable
            columns={columns}
            data={accessList}
            noData={!isLoading && accessList.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 28, height: 28 }}
            loading={isLoading}
            pagingData={{
                total: accessListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            checkboxChecked={(row) =>
                selectedAccess.some((selected) => selected.id === row.id)
            }
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllRowSelect}
        />
    )
}

export default AccessListTable
