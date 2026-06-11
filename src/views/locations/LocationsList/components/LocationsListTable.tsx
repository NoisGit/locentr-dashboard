import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DataTable from '@/components/shared/DataTable'
import Tooltip from '@/components/ui/Tooltip'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import useLocationsList from '../hooks/useLocationsList'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { Location } from '../types'
import { useAuth } from '@/auth'
import { Permission, RBAC } from '@/utils/rbac'

const NameColumn = ({ row }: { row: Location }) => {
    return (
        <Link
            className="hover:text-primary font-semibold text-gray-900 dark:text-gray-100"
            to={`/buildings/${row.id}`}
        >
            {row.name || 'Ubicación sin nombre'}
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

const LocationsListTable = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const canEdit = RBAC.hasPermission(user, Permission.EDIT_LOCATION)
    const { locationsList, locationsListTotal, tableData, isLoading, setTableData } =
        useLocationsList()

    const columns: ColumnDef<Location>[] = useMemo(
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
                cell: (props) =>
                    canEdit ? (
                        <ActionColumn
                            onEdit={() => navigate(`/buildings/${props.row.original.id}/edit`)}
                        />
                    ) : null,
            },
        ],
        [canEdit, navigate],
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

    return (
        <DataTable
            columns={columns}
            data={locationsList}
            noData={!isLoading && locationsList.length === 0}
            loading={isLoading}
            pagingData={{
                total: locationsListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
        />
    )
}

export default LocationsListTable
