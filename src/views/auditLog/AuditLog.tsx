import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import AuditLogList from './components/AuditLogList'
import AuditLogStats from './components/AuditLogStats'
import { useAuditLog } from './hooks/useAuditLog'

const AuditLog = () => {
    const { data, isLoading, mutate } = useAuditLog()
    const entries = data?.items ?? []

    return (
        <Container>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3>Audit Log</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Review security and system activity across Coredeck.
                        </p>
                    </div>
                    <Button onClick={() => mutate()}>Refresh</Button>
                </div>

                <AuditLogStats
                    total={data?.total ?? entries.length}
                    visible={entries.length}
                />

                <AdaptiveCard>
                    <Loading loading={isLoading}>
                        <AuditLogList entries={entries} />
                    </Loading>
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default AuditLog
