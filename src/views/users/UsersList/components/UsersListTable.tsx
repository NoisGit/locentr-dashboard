import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DataTable from '@/components/shared/DataTable'
import Tooltip from '@/components/ui/Tooltip'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil } from 'react-icons/tb'
import useUsersList from '../hooks/useUsersList'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { UserRow } from '@/services/UsersService'
import { useAuth } from '@/auth'
import { Permission, RBAC, Role } from '@/utils/rbac'

const roleLabels: Record<string, string> = {
    SUPERADMIN: 'Superadministrador',
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    CLIENT: 'Cliente',
}

const NameColumn = ({ row }: { row: UserRow }) => {
    return (
        <Link
            className="hover:text-primary font-semibold text-gray-900 dark:text-gray-100"
            to={`/users/${row.id}`}
        >
            {row.name || row.email || 'Usuario sin nombre'}
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

const UsersListTable = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const canEdit = RBAC.hasPermission(user, Permission.EDIT_USER)
    const { usersList, usersListTotal, tableData, isLoading, setTableData } = useUsersList()

    const columns: ColumnDef<UserRow>[] = useMemo(
        () => [
            {
                header: 'Nombre',
                accessorKey: 'name',
                cell: (props) => <NameColumn row={props.row.original} />,
            },
            {
                header: 'Email',
                accessorKey: 'email',
                cell: (props) => <span>{props.row.original.email || 'Sin email'}</span>,
            },
            {
                header: 'Rol',
                accessorKey: 'role',
                cell: (props) => (
                    <span>{roleLabels[String(props.row.original.role)] || 'Sin rol'}</span>
                ),
            },
            {
                header: 'Estado',
                accessorKey: 'status',
                cell: (props) => (
                    <span>
                        {props.row.original.is_active === false ||
                        props.row.original.status === false
                            ? 'Inactivo'
                            : 'Activo'}
                    </span>
                ),
            },
            {
                header: '',
                id: 'action',
                cell: (props) =>
                    canEdit &&
                    !(
                        RBAC.hasRole(user, Role.ADMIN) &&
                        (props.row.original.role === Role.ADMIN ||
                            props.row.original.role === Role.SUPERADMIN)
                    ) ? (
                        <ActionColumn
                            onEdit={() => navigate(`/users/${props.row.original.id}/edit`)}
                        />
                    ) : null,
            },
        ],
        [canEdit, navigate, user],
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
            data={usersList}
            noData={!isLoading && usersList.length === 0}
            loading={isLoading}
            pagingData={{
                total: usersListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
        />
    )
}

export default UsersListTable
