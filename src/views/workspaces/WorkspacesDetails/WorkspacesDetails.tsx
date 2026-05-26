import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Tabs from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import WorkspaceDetailsHeader from './components/WorkspaceDetailsHeader'
import WorkspaceOverviewTab from './components/WorkspaceOverviewTab'
import WorkspaceOperatorsTab from './components/WorkspaceOperatorsTab'
import WorkspaceAccessTab from './components/WorkspaceAccessTab'
import WorkspaceContactsTab from './components/WorkspaceContactsTab'
import WorkspaceLogbookTab from './components/WorkspaceLogbookTab'
import WorkspacePoliceAccessTab from './components/WorkspacePoliceAccessTab'
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

    useEffect(() => {
        if (workspaceId) {
            localStorage.setItem('current_location_id', workspaceId)
        }
    }, [workspaceId])

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
                <WorkspaceDetailsHeader
                    title={data?.name}
                    workspaceId={workspaceId}
                    onBack={() => navigate('/workspaces')}
                    onEdit={() => navigate(`/workspaces/${workspaceId}/edit`)}
                />

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
                            <WorkspaceOverviewTab data={data} />
                        </TabContent>
                        <TabContent value="operators">
                            <WorkspaceOperatorsTab operators={operators} />
                        </TabContent>
                        <TabContent value="access">
                            <WorkspaceAccessTab accessEntries={accessEntries} />
                        </TabContent>
                        <TabContent value="contacts">
                            <WorkspaceContactsTab
                                emergencyContacts={emergencyContacts}
                                serviceContacts={serviceContacts}
                            />
                        </TabContent>
                        <TabContent value="logbook">
                            <WorkspaceLogbookTab
                                entries={logbookEntries}
                                settings={logbookSettings}
                            />
                        </TabContent>
                        <TabContent value="police">
                            <WorkspacePoliceAccessTab
                                isGenerating={isGeneratingPoliceLink}
                                policeLink={policeLink}
                                onGenerate={handleGeneratePoliceLink}
                            />
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        </Loading>
    )
}

export default WorkspacesDetails
