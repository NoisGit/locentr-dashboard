import Card from '@/components/ui/Card'
import type {
    EmergencyContact,
    PaginatedResponse,
    ServiceContact,
} from '@/services/ContactsService'

type WorkspaceContactsTabProps = {
    emergencyContacts?: PaginatedResponse<EmergencyContact>
    serviceContacts?: PaginatedResponse<ServiceContact>
}

const WorkspaceContactsTab = ({
    emergencyContacts,
    serviceContacts,
}: WorkspaceContactsTabProps) => {
    return (
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
    )
}

export default WorkspaceContactsTab
