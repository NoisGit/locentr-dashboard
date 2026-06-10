import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import EmptyState from '@/components/shared/EmptyState'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useAuth } from '@/auth'
import { RBAC, Role } from '@/utils/rbac'
import useLogbook from './hooks/useLogbook'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { LocationLogbookEntry } from '@/services/LocationLogbookService'

function formatDate(value?: string) {
    if (!value) return 'Sin fecha'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Sin fecha'

    return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const Logbook = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const locationId = localStorage.getItem('current_location_id') || ''
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { data, isLoading, createEntry } = useLogbook({
        locationId,
        pageIndex,
        pageSize,
    })
    const canCreate = RBAC.hasAnyRole(user, [Role.SUPERADMIN, Role.OPERATOR])
    const entries = data?.items ?? []
    const total = data?.total ?? 0

    const columns: ColumnDef<LocationLogbookEntry>[] = useMemo(
        () => [
            {
                header: 'Novedad',
                accessorKey: 'description',
                cell: (props) => (
                    <div className="max-w-2xl whitespace-pre-wrap">
                        {props.row.original.description}
                    </div>
                ),
            },
            {
                header: 'Registrado por',
                accessorKey: 'user_full_name',
                cell: (props) =>
                    props.row.original.user_full_name || 'Usuario del edificio',
            },
            {
                header: 'Fecha',
                accessorKey: 'created_at',
                cell: (props) => formatDate(props.row.original.created_at),
            },
        ],
        [],
    )

    const handleSubmit = async () => {
        if (!description.trim()) return
        try {
            setIsSubmitting(true)
            await createEntry(description)
            setDescription('')
            toast.push(
                <Notification type="success">Novedad registrada.</Notification>,
                { placement: 'top-center' },
            )
        } catch {
            toast.push(
                <Notification type="danger">
                    No fue posible registrar la novedad.
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!locationId) {
        return (
            <Container>
                <EmptyState
                    title="Selecciona un edificio"
                    description="Abre un edificio para consultar su libro de novedades."
                    actionLabel="Ver edificios"
                    onAction={() => navigate('/buildings')}
                />
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex flex-col gap-5">
                <div>
                    <h3>Libro de novedades</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Registro cronológico de hechos importantes del edificio seleccionado.
                    </p>
                </div>

                {canCreate ? (
                    <section className="border-y border-gray-200 py-5 dark:border-gray-800">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <Input
                                textArea
                                rows={3}
                                maxLength={1000}
                                className="min-h-[90px] flex-1 resize-none"
                                placeholder="Describe la novedad de forma clara"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                            />
                            <Button
                                variant="solid"
                                loading={isSubmitting}
                                disabled={!description.trim()}
                                onClick={handleSubmit}
                            >
                                Registrar novedad
                            </Button>
                        </div>
                        <div className="mt-2 text-right text-xs text-gray-400">
                            {description.length}/1000
                        </div>
                    </section>
                ) : null}

                <DataTable
                    columns={columns}
                    data={entries}
                    loading={isLoading}
                    noData={!isLoading && entries.length === 0}
                    pagingData={{ total, pageIndex, pageSize }}
                    onPaginationChange={setPageIndex}
                    onSelectChange={(value) => {
                        setPageSize(Number(value))
                        setPageIndex(1)
                    }}
                />
            </div>
        </Container>
    )
}

export default Logbook
