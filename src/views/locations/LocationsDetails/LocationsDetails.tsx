import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbArrowLeft, TbPencil } from 'react-icons/tb'
import {
    apiGetLocationAccessEntries,
    apiGetLocationById,
    apiListLocationOperators,
} from '@/services/LocationsService'
import {
    apiListEmergencyContacts,
    apiListServiceContacts,
} from '@/services/ContactsService'
import {
    apiGetLocationLogbookSettings,
    apiListLocationLogbookEntries,
} from '@/services/LocationLogbookService'
import {
    apiGetDocumentDownloadUrl,
    apiListAllDocuments,
    apiListMyCompanyDocuments,
} from '@/services/DocumentsService'
import { useAuth } from '@/auth'
import { Permission, RBAC, Role } from '@/utils/rbac'
import { getApiErrorMessage } from '@/utils/apiError'
import PoliceAccessPanel from './PoliceAccessPanel'

const { TabNav, TabList, TabContent } = Tabs

function formatFileSize(size?: number | null) {
    if (!size) return 'Tamaño desconocido'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(date?: string | null) {
    if (!date) return 'Sin fecha'
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

const LocationsDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const locationIdText = useMemo(
        () => (id ? String(id).replace(/\/+$/, '') : ''),
        [id],
    )
    const locationId = Number(locationIdText)
    const { user } = useAuth()
    const role = RBAC.extractUserRole(user)
    const canEdit = RBAC.hasPermission(user, Permission.EDIT_LOCATION)
    const canViewOperators = RBAC.hasAnyRole(user, [
        Role.SUPERADMIN,
        Role.ADMIN,
        Role.CLIENT,
    ])
    const canViewAccessEntries = RBAC.hasAnyRole(user, [
        Role.SUPERADMIN,
        Role.OPERATOR,
    ])
    const canViewDocuments = RBAC.hasAnyRole(user, [
        Role.SUPERADMIN,
        Role.ADMIN,
    ])
    const canGeneratePoliceLink = role === Role.OPERATOR

    useEffect(() => {
        if (locationIdText) {
            localStorage.setItem('current_location_id', locationIdText)
        }
    }, [locationIdText])

    const { data, isLoading } = useSWR(
        locationIdText ? ['locations:detail', locationIdText] : null,
        ([, currentId]) => apiGetLocationById(currentId as string),
        { revalidateOnFocus: false },
    )

    const companyId = data?.companyId ?? data?.companyIds?.[0]

    const { data: operators } = useSWR(
        Number.isFinite(locationId) && canViewOperators
            ? ['locations:operators', locationId]
            : null,
        ([, currentId]) =>
            apiListLocationOperators(currentId as number, { page: 1, size: 5 }),
        { revalidateOnFocus: false },
    )

    const { data: accessEntries } = useSWR(
        locationIdText && canViewAccessEntries
            ? ['locations:access-entries', locationIdText]
            : null,
        ([, currentId]) => apiGetLocationAccessEntries(currentId as string),
        { revalidateOnFocus: false },
    )

    const { data: emergencyContacts } = useSWR(
        Number.isFinite(locationId)
            ? ['locations:emergency-contacts', locationId]
            : null,
        ([, currentId]) =>
            apiListEmergencyContacts({
                location_id: currentId as number,
                page: 1,
                size: 5,
            }),
        { revalidateOnFocus: false },
    )

    const { data: serviceContacts } = useSWR(
        Number.isFinite(locationId)
            ? ['locations:service-contacts', locationId]
            : null,
        ([, currentId]) =>
            apiListServiceContacts({
                location_id: currentId as number,
                page: 1,
                size: 5,
            }),
        { revalidateOnFocus: false },
    )

    const { data: documents } = useSWR(
        companyId && canViewDocuments
            ? ['locations:documents', companyId, role]
            : null,
        ([, currentCompanyId]) =>
            role === Role.SUPERADMIN
                ? apiListAllDocuments({
                      company_id: currentCompanyId as number,
                      page: 1,
                      size: 5,
                  })
                : apiListMyCompanyDocuments({ page: 1, size: 5 }),
        { revalidateOnFocus: false },
    )

    const { data: logbookSettings } = useSWR(
        locationIdText ? ['locations:logbook-settings', locationIdText] : null,
        ([, currentId]) => apiGetLocationLogbookSettings(currentId as string),
        { revalidateOnFocus: false },
    )

    const { data: logbookEntries } = useSWR(
        locationIdText ? ['locations:logbook-entries', locationIdText] : null,
        ([, currentId]) =>
            apiListLocationLogbookEntries(currentId as string, {
                page: 1,
                size: 5,
            }),
        { revalidateOnFocus: false },
    )

    const handleDownloadDocument = async (documentId: number) => {
        try {
            const response = await apiGetDocumentDownloadUrl(documentId)
            window.open(response.url, '_blank', 'noopener,noreferrer')
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(
                        error,
                        'No se pudo generar el enlace de descarga.',
                    )}
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    return (
        <Loading loading={isLoading}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3>{data?.name || 'Detalle de ubicación'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Control operativo, accesos y registros de esta
                            ubicación.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            icon={<TbArrowLeft />}
                            onClick={() => navigate('/buildings')}
                        >
                            Volver
                        </Button>
                        {locationIdText && canEdit ? (
                            <Button
                                variant="solid"
                                icon={<TbPencil />}
                                onClick={() =>
                                    navigate(
                                        `/buildings/${locationIdText}/edit`,
                                    )
                                }
                            >
                                Editar
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Tabs defaultValue="overview">
                    <TabList>
                        <TabNav value="overview">Resumen</TabNav>
                        {canViewOperators ? (
                            <TabNav value="operators">Operadores</TabNav>
                        ) : null}
                        {canViewAccessEntries ? (
                            <TabNav value="access">Accesos</TabNav>
                        ) : null}
                        <TabNav value="contacts">Contactos</TabNav>
                        {canViewDocuments ? (
                            <TabNav value="documents">Documentos</TabNav>
                        ) : null}
                        <TabNav value="logbook">Libro de novedades</TabNav>
                        {canGeneratePoliceLink ? (
                            <TabNav value="external">Acceso policial</TabNav>
                        ) : null}
                    </TabList>

                    <div className="pt-4">
                        <TabContent value="overview">
                            <Card>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Nombre
                                        </div>
                                        <div className="font-medium">
                                            {data?.name || 'Sin nombre'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Dirección
                                        </div>
                                        <div className="font-medium">
                                            {data?.address || 'Sin dirección'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            País
                                        </div>
                                        <div className="font-medium">
                                            {data?.country || 'Sin país'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Estado
                                        </div>
                                        <div className="font-medium">
                                            {data?.isActive === false
                                                ? 'Inactiva'
                                                : 'Activa'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </TabContent>

                        {canViewOperators ? (
                            <TabContent value="operators">
                                <Card>
                                    <h5>Operadores asignados</h5>
                                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                        {operators?.items
                                            ?.slice(0, 5)
                                            .map((operator) => (
                                                <div
                                                    key={operator.id}
                                                    className="py-3 flex justify-between gap-3"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {operator.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {operator.email}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm">
                                                        {operator.status
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </div>
                                                </div>
                                            )) || (
                                            <div className="text-sm text-gray-500">
                                                No hay operadores asignados.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabContent>
                        ) : null}

                        {canViewAccessEntries ? (
                            <TabContent value="access">
                                <Card>
                                    <h5>Entradas de acceso</h5>
                                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                        {accessEntries
                                            ?.slice(0, 5)
                                            .map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="py-3 flex justify-between gap-3"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {entry.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {entry.id_number}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-semibold">
                                                        {entry.type_access_list}
                                                    </div>
                                                </div>
                                            )) || (
                                            <div className="text-sm text-gray-500">
                                                No hay accesos registrados.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabContent>
                        ) : null}

                        <TabContent value="contacts">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <Card>
                                    <h5>Contactos de emergencia</h5>
                                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                        {emergencyContacts?.items
                                            ?.slice(0, 5)
                                            .map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    className="py-3 flex justify-between gap-3"
                                                >
                                                    <div className="font-medium">
                                                        {contact.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {contact.phone}
                                                    </div>
                                                </div>
                                            )) || (
                                            <div className="text-sm text-gray-500">
                                                No hay contactos de emergencia.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                                <Card>
                                    <h5>Contactos de servicio</h5>
                                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                        {serviceContacts?.items
                                            ?.slice(0, 5)
                                            .map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    className="py-3 flex justify-between gap-3"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                contact.service_name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                contact.person_name
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {contact.phone}
                                                    </div>
                                                </div>
                                            )) || (
                                            <div className="text-sm text-gray-500">
                                                No hay contactos de servicio.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </TabContent>

                        {canViewDocuments ? (
                            <TabContent value="documents">
                                <Card>
                                    <h5>Documentos</h5>
                                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                        {documents?.items
                                            ?.slice(0, 5)
                                            .map((document) => (
                                                <div
                                                    key={document.id}
                                                    className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {document.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {document.file_name}{' '}
                                                            ·{' '}
                                                            {formatFileSize(
                                                                document.size_bytes,
                                                            )}{' '}
                                                            ·{' '}
                                                            {formatDate(
                                                                document.created_at,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDownloadDocument(
                                                                document.id,
                                                            )
                                                        }
                                                    >
                                                        Descargar
                                                    </Button>
                                                </div>
                                            )) || (
                                            <div className="text-sm text-gray-500">
                                                No hay documentos.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabContent>
                        ) : null}

                        <TabContent value="logbook">
                            <Card>
                                <div className="flex items-center justify-between gap-3">
                                    <h5>Libro de novedades</h5>
                                    <div className="text-sm font-semibold">
                                        {logbookSettings?.is_enabled
                                            ? 'Activo'
                                            : 'Inactivo'}
                                    </div>
                                </div>
                                <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                    {logbookEntries?.items
                                        ?.slice(0, 5)
                                        .map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="py-3"
                                            >
                                                <div className="font-medium">
                                                    {entry.user_full_name ||
                                                        'Usuario desconocido'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {entry.description}
                                                </div>
                                            </div>
                                        )) || (
                                        <div className="text-sm text-gray-500">
                                            No hay novedades registradas.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabContent>

                        {canGeneratePoliceLink ? (
                            <TabContent value="external">
                                <Card>
                                    <PoliceAccessPanel
                                        locationId={locationId}
                                    />
                                </Card>
                            </TabContent>
                        ) : null}
                    </div>
                </Tabs>
            </div>
        </Loading>
    )
}

export default LocationsDetails
