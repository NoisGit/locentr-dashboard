import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbArrowLeft, TbExternalLink, TbPencil, TbQrcode } from 'react-icons/tb'
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
    apiCreatePoliceLogbookAccess,
    apiGetLocationLogbookSettings,
    apiListLocationLogbookEntries,
} from '@/services/LocationLogbookService'

const { TabNav, TabList, TabContent } = Tabs

function toItemsLength(value?: { items?: unknown[] }) {
    return value?.items?.length ?? 0
}

function getErrorMessage(error: unknown, fallback: string) {
    const requestError = error as {
        response?: { data?: { message?: string; detail?: string } }
        message?: string
    }

    return (
        requestError?.response?.data?.message ||
        requestError?.response?.data?.detail ||
        requestError?.message ||
        fallback
    )
}

const WorkspacesDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const workspaceId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const locationId = Number(workspaceId)
    const [policeLink, setPoliceLink] = useState('')
    const [isGeneratingPoliceLink, setIsGeneratingPoliceLink] = useState(false)

    const { data, isLoading } = useSWR(
        workspaceId ? ['workspaces:detail', workspaceId] : null,
        ([, currentId]) => apiGetLocationById(currentId as string),
        { revalidateOnFocus: false },
    )

    const { data: operators } = useSWR(
        Number.isFinite(locationId) ? ['workspaces:operators', locationId] : null,
        ([, currentId]) => apiListLocationOperators(currentId as number, { page: 1, size: 5 }),
        { revalidateOnFocus: false },
    )

    const { data: accessEntries } = useSWR(
        workspaceId ? ['workspaces:access-entries', workspaceId] : null,
        ([, currentId]) => apiGetLocationAccessEntries(currentId as string),
        { revalidateOnFocus: false },
    )

    const { data: emergencyContacts } = useSWR(
        Number.isFinite(locationId) ? ['workspaces:emergency-contacts', locationId] : null,
        ([, currentId]) => apiListEmergencyContacts({ location_id: currentId as number, page: 1, size: 5 }),
        { revalidateOnFocus: false },
    )

    const { data: serviceContacts } = useSWR(
        Number.isFinite(locationId) ? ['workspaces:service-contacts', locationId] : null,
        ([, currentId]) => apiListServiceContacts({ location_id: currentId as number, page: 1, size: 5 }),
        { revalidateOnFocus: false },
    )

    const { data: logbookSettings } = useSWR(
        workspaceId ? ['workspaces:logbook-settings', workspaceId] : null,
        ([, currentId]) => apiGetLocationLogbookSettings(currentId as string),
        { revalidateOnFocus: false },
    )

    const { data: logbookEntries } = useSWR(
        workspaceId ? ['workspaces:logbook-entries', workspaceId] : null,
        ([, currentId]) => apiListLocationLogbookEntries(currentId as string, { page: 1, size: 5 }),
        { revalidateOnFocus: false },
    )

    const handleGeneratePoliceLink = async () => {
        if (!Number.isFinite(locationId)) return

        try {
            setIsGeneratingPoliceLink(true)
            const response = await apiCreatePoliceLogbookAccess({ location_id: locationId })
            setPoliceLink(response.relative_path)
            toast.push(<Notification type="success">Police logbook link generated.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'Police logbook link could not be generated.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsGeneratingPoliceLink(false)
        }
    }

    return (
        <Loading loading={isLoading}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3>{data?.name || 'Workspace details'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Security, access and operational controls for this location.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button icon={<TbArrowLeft />} onClick={() => navigate('/workspaces')}>
                            Back
                        </Button>
                        {workspaceId ? (
                            <Button
                                variant="solid"
                                icon={<TbPencil />}
                                onClick={() => navigate(`/workspaces/${workspaceId}/edit`)}
                            >
                                Edit
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Tabs defaultValue="overview">
                    <TabList>
                        <TabNav value="overview">Overview</TabNav>
                        <TabNav value="operators">Operators</TabNav>
                        <TabNav value="access">Access</TabNav>
                        <TabNav value="contacts">Contacts</TabNav>
                        <TabNav value="logbook">Logbook</TabNav>
                        <TabNav value="police">Police QR</TabNav>
                    </TabList>

                    <div className="pt-4">
                        <TabContent value="overview">
                            <Card>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Name</div>
                                        <div className="font-medium">{data?.name || 'No name'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                                        <div className="font-medium">{data?.address || 'No address'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Country</div>
                                        <div className="font-medium">{data?.country || 'No country'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                                        <div className="font-medium">
                                            {data?.isActive === false ? 'Inactive' : 'Active'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </TabContent>

                        <TabContent value="operators">
                            <Card>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h5>Assigned operators</h5>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Operators that can work with this location.
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {toItemsLength(operators)} visible
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {operators?.items?.slice(0, 5).map((operator) => (
                                            <div key={operator.id} className="py-3 flex justify-between gap-3">
                                                <div>
                                                    <div className="font-medium">{operator.full_name}</div>
                                                    <div className="text-sm text-gray-500">{operator.email}</div>
                                                </div>
                                                <div className="text-sm">
                                                    {operator.status ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>
                                        )) || <div className="text-sm text-gray-500">No operators found.</div>}
                                    </div>
                                </div>
                            </Card>
                        </TabContent>

                        <TabContent value="access">
                            <Card>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <h5>Access entries</h5>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Effective whitelist and blacklist records for this location.
                                        </p>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {accessEntries?.slice(0, 5).map((entry) => (
                                            <div key={entry.id} className="py-3 flex justify-between gap-3">
                                                <div>
                                                    <div className="font-medium">{entry.full_name}</div>
                                                    <div className="text-sm text-gray-500">{entry.id_number}</div>
                                                </div>
                                                <div className="text-sm font-semibold">{entry.type_access_list}</div>
                                            </div>
                                        )) || <div className="text-sm text-gray-500">No access entries found.</div>}
                                    </div>
                                </div>
                            </Card>
                        </TabContent>

                        <TabContent value="contacts">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <Card>
                                    <h5>Emergency contacts</h5>
                                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                        {emergencyContacts?.items?.slice(0, 5).map((contact) => (
                                            <div key={contact.id} className="py-3 flex justify-between gap-3">
                                                <div className="font-medium">{contact.name}</div>
                                                <div className="text-sm text-gray-500">{contact.phone}</div>
                                            </div>
                                        )) || <div className="text-sm text-gray-500">No emergency contacts found.</div>}
                                    </div>
                                </Card>
                                <Card>
                                    <h5>Service contacts</h5>
                                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                                        {serviceContacts?.items?.slice(0, 5).map((contact) => (
                                            <div key={contact.id} className="py-3 flex justify-between gap-3">
                                                <div>
                                                    <div className="font-medium">{contact.service_name}</div>
                                                    <div className="text-sm text-gray-500">{contact.person_name}</div>
                                                </div>
                                                <div className="text-sm text-gray-500">{contact.phone}</div>
                                            </div>
                                        )) || <div className="text-sm text-gray-500">No service contacts found.</div>}
                                    </div>
                                </Card>
                            </div>
                        </TabContent>

                        <TabContent value="logbook">
                            <Card>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h5>Location logbook</h5>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Operational records and visual evidence for this location.
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {logbookSettings?.is_enabled ? 'Enabled' : 'Disabled'}
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {logbookEntries?.items?.slice(0, 5).map((entry) => (
                                            <div key={entry.id} className="py-3">
                                                <div className="font-medium">{entry.user_full_name || 'Unknown user'}</div>
                                                <div className="text-sm text-gray-500">{entry.description}</div>
                                            </div>
                                        )) || <div className="text-sm text-gray-500">No logbook entries found.</div>}
                                    </div>
                                </div>
                            </Card>
                        </TabContent>

                        <TabContent value="police">
                            <Card>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h5>Police logbook access</h5>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Generate a one-use public link for external review without dashboard login.
                                        </p>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <Button
                                            variant="solid"
                                            icon={<TbQrcode />}
                                            loading={isGeneratingPoliceLink}
                                            onClick={handleGeneratePoliceLink}
                                        >
                                            Generate QR link
                                        </Button>
                                        {policeLink ? (
                                            <a
                                                className="inline-flex items-center gap-2 text-primary font-medium"
                                                href={policeLink}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                Open generated link <TbExternalLink />
                                            </a>
                                        ) : null}
                                    </div>
                                    {policeLink ? (
                                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm break-all">
                                            {policeLink}
                                        </div>
                                    ) : null}
                                </div>
                            </Card>
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        </Loading>
    )
}

export default WorkspacesDetails
