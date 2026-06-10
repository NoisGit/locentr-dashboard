import { useEffect, useMemo, useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import { useAuth } from '@/auth'
import { Permission, RBAC } from '@/utils/rbac'
import AccessListSection from './components/AccessListSection'
import AccessLogsSection from './components/AccessLogsSection'
import type { TabItem, TabKey } from './types'

const AccessManagement = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<TabKey>('whitelist')
    const canCreate = RBAC.hasPermission(user, Permission.CREATE_ACCESS_ENTRY)
    const canRemove = RBAC.hasPermission(user, Permission.REVOKE_ACCESS_ENTRY)
    const canViewLogs = RBAC.hasPermission(user, Permission.VIEW_ACCESS_LOGS)
    const canViewLists = canCreate || canRemove

    const tabs = useMemo<TabItem[]>(
        () => [
            ...(canViewLists
                ? [
                      { key: 'whitelist' as const, label: 'Lista autorizada' },
                      { key: 'blacklist' as const, label: 'Lista restringida' },
                  ]
                : []),
            ...(canViewLogs
                ? [{ key: 'logs' as const, label: 'Registro de accesos' }]
                : []),
        ],
        [canViewLists, canViewLogs],
    )

    useEffect(() => {
        if (!tabs.some((tab) => tab.key === activeTab) && tabs[0]) {
            setActiveTab(tabs[0].key)
        }
    }, [activeTab, tabs])

    return (
        <Container>
            <div className="flex flex-col gap-5">
                <div>
                    <h3>Control de accesos</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Administra personas, autorizaciones, restricciones y registros desde un solo lugar.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 dark:border-gray-800">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.key}
                            size="sm"
                            variant={activeTab === tab.key ? 'solid' : 'default'}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {tabs.length === 0 ? (
                    <EmptyState
                        title="Sin acciones disponibles"
                        description="Tu rol no tiene permisos operativos dentro de este módulo."
                    />
                ) : null}
                {activeTab === 'whitelist' && canViewLists ? (
                    <AccessListSection
                        canCreate={canCreate}
                        canRemove={canRemove}
                        type="whitelist"
                    />
                ) : null}
                {activeTab === 'blacklist' && canViewLists ? (
                    <AccessListSection
                        canCreate={canCreate}
                        canRemove={canRemove}
                        type="blacklist"
                    />
                ) : null}
                {activeTab === 'logs' && canViewLogs ? <AccessLogsSection /> : null}
            </div>
        </Container>
    )
}

export default AccessManagement
