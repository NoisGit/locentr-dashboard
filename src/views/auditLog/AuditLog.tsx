import { useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import AuditLogList from './components/AuditLogList'
import AuditLogStats from './components/AuditLogStats'
import { useAuditLog } from './hooks/useAuditLog'

const AuditLog = () => {
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { data, isLoading, mutate } = useAuditLog({ pageIndex, pageSize })
    const entries = useMemo(() => data?.items ?? [], [data?.items])
    const total = data?.total ?? 0

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handlePageSizeChange = (value: number) => {
        setPageSize(Number(value))
        setPageIndex(1)
    }

    return (
        <Container>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3>Auditoría</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Revisa actividad de seguridad y sistema registrada en Locentr.
                        </p>
                    </div>
                    <Button onClick={() => mutate()}>Actualizar</Button>
                </div>

                <AuditLogStats total={total} visible={entries.length} />

                <AdaptiveCard>
                    <AuditLogList
                        entries={entries}
                        isLoading={isLoading}
                        total={total}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handlePageSizeChange}
                    />
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default AuditLog
