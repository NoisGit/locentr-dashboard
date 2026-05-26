import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import UsersList from '@/views/users/UsersList/UsersList'
import AccessListSection from './components/AccessListSection'
import AccessLogsSection from './components/AccessLogsSection'
import type { TabItem, TabKey } from './types'

const tabs: TabItem[] = [
    { key: 'users', label: 'Users' },
    { key: 'whitelist', label: 'Whitelist' },
    { key: 'blacklist', label: 'Blacklist' },
    { key: 'logs', label: 'Access logs' },
]

const AccessManagement = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('users')

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div>
                        <h3>Access Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage users, access lists and access logs from one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.key}
                                variant={activeTab === tab.key ? 'solid' : 'default'}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {activeTab === 'users' ? <UsersList /> : null}
                    {activeTab === 'whitelist' ? <AccessListSection type="whitelist" /> : null}
                    {activeTab === 'blacklist' ? <AccessListSection type="blacklist" /> : null}
                    {activeTab === 'logs' ? <AccessLogsSection /> : null}
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default AccessManagement
