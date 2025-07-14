import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import usePerksList from '../hooks/usePerksList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbEye } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Perk } from '../types'
import type { TableQueries } from '@/@types/common'

const NameColumn = ({ row }: { row: Perk }) => {
    return (
        <div className="flex items-center">
            <Avatar size={40} shape="circle" src={row.img} />
            <Link
                className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
                to={`/concepts/perks/perks-details/${row.id}`}
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

const PerksListTable = () => {
    const navigate = useNavigate()

    const {
        perksList,
        perksListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllPerks,
        setSelectedPerks,
        selectedPerks,
    } = usePerksList()

    const handleEdit = (perk: Perk) => {
        navigate(`/concepts/perks/perks-edit/${perk.id}`)
    }

    const handleViewDetails = (perk: Perk) => {
        navigate(`/concepts/perks/perks-details/${perk.id}`)
    }

    const columns: ColumnDef<Perk>[] = useMemo(
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
        if (selectedPerks.length > 0) {
            setSelectAllPerks([])
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

    const handleRowSelect = (checked: boolean, row: Perk) => {
        setSelectedPerks(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<Perk>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllPerks(originalRows)
        } else {
            setSelectAllPerks([])
        }
    }

    return (
        <DataTable
            selectable
            columns={columns}
            data={perksList}
            noData={!isLoading && perksList.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 28, height: 28 }}
            loading={isLoading}
            pagingData={{
                total: perksListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            checkboxChecked={(row) =>
                selectedPerks.some((selected) => selected.id === row.id)
            }
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllRowSelect}
        />
    )
}

export default PerksListTable
