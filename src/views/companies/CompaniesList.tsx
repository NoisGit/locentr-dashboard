import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import Tag from '@/components/ui/Tag'
import EmptyState from '@/components/shared/EmptyState'
import { useAuth } from '@/auth'
import { Permission, RBAC, Role } from '@/utils/rbac'
import useCompaniesList from './useCompaniesList'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { Company } from '@/services/CompaniesService'

const CompaniesList = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { companies, total, isLoading, error, mutate } = useCompaniesList({
        pageIndex,
        pageSize,
    })
    const isSuperAdmin = RBAC.hasRole(user, Role.SUPERADMIN)
    const canCreateSubcompany = RBAC.hasPermission(
        user,
        Permission.CREATE_COMPANY,
    )
    const canEdit = RBAC.hasPermission(user, Permission.EDIT_COMPANY)

    const columns: ColumnDef<Company>[] = useMemo(
        () => [
            {
                header: 'Empresa',
                accessorKey: 'name',
                cell: (props) => (
                    <div className="min-w-0">
                        <Link
                            to={`/companies/${props.row.original.id}`}
                            className="font-semibold text-gray-900 hover:text-primary dark:text-gray-100"
                        >
                            {props.row.original.name}
                        </Link>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {props.row.original.activity ||
                                'Sin actividad informada'}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Documento',
                accessorKey: 'id_number',
                cell: (props) => (
                    <span>
                        {props.row.original.type_document || 'Documento'}{' '}
                        {props.row.original.id_number || 'no informado'}
                    </span>
                ),
            },
            {
                header: 'Tipo',
                accessorKey: 'parent_company_id',
                cell: (props) => (
                    <Tag>
                        {props.row.original.parent_company_id
                            ? 'Subempresa'
                            : 'Empresa principal'}
                    </Tag>
                ),
            },
            {
                header: 'Estado',
                accessorKey: 'is_active',
                cell: (props) => (
                    <Tag>
                        {props.row.original.is_active === false
                            ? 'Inactiva'
                            : 'Activa'}
                    </Tag>
                ),
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            onClick={() =>
                                navigate(`/companies/${props.row.original.id}`)
                            }
                        >
                            Ver
                        </Button>
                        {canEdit ? (
                            <Button
                                size="sm"
                                onClick={() =>
                                    navigate(
                                        `/companies/${props.row.original.id}/edit`,
                                    )
                                }
                            >
                                Editar
                            </Button>
                        ) : null}
                    </div>
                ),
            },
        ],
        [canEdit, navigate],
    )

    if (!isLoading && error) {
        return (
            <Container>
                <EmptyState
                    title="No fue posible cargar las empresas"
                    description="Revisa la conexión e intenta nuevamente."
                    actionLabel="Reintentar"
                    onAction={() => mutate()}
                />
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3>Empresas</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Gestiona la estructura empresarial disponible para tu cuenta.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canCreateSubcompany ? (
                            <Button
                                onClick={() =>
                                    navigate('/companies/subcompany/create')
                                }
                            >
                                Crear subempresa
                            </Button>
                        ) : null}
                        {isSuperAdmin ? (
                            <Button
                                variant="solid"
                                onClick={() => navigate('/companies/create')}
                            >
                                Crear empresa
                            </Button>
                        ) : null}
                    </div>
                </div>

                {!isLoading && companies.length === 0 ? (
                    <EmptyState
                        title="Aún no hay empresas"
                        description="Las empresas disponibles para tu cuenta aparecerán aquí."
                        actionLabel={
                            isSuperAdmin ? 'Crear empresa' : undefined
                        }
                        onAction={
                            isSuperAdmin
                                ? () => navigate('/companies/create')
                                : undefined
                        }
                    />
                ) : (
                    <section className="border-t border-gray-200 pt-4 dark:border-gray-800">
                        <DataTable
                            columns={columns}
                            data={companies}
                            loading={isLoading}
                            noData={!isLoading && companies.length === 0}
                            pagingData={{ total, pageIndex, pageSize }}
                            onPaginationChange={setPageIndex}
                            onSelectChange={(value) => {
                                setPageSize(Number(value))
                                setPageIndex(1)
                            }}
                        />
                    </section>
                )}
            </div>
        </Container>
    )
}

export default CompaniesList
