import { useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { SUPERADMIN } from '@/constants/roles.constant'
import { apiGetDocumentDownloadUrl } from '@/services/DocumentsService'
import DocumentsList from './components/DocumentsList'
import DocumentsStats from './components/DocumentsStats'
import { useDocuments } from './hooks/useDocuments'

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

const Documents = () => {
    const role = useSessionUser((state) => state.user.role)
    const authority = useSessionUser((state) => state.user.authority ?? [])
    const isSuperAdmin = role === SUPERADMIN || authority.includes(SUPERADMIN)
    const [search, setSearch] = useState('')
    const { data, isLoading, mutate } = useDocuments({ isSuperAdmin, search })
    const documents = data?.items ?? []
    const totalSize = useMemo(
        () => documents.reduce((total, document) => total + (document.size_bytes ?? 0), 0),
        [documents],
    )

    const handleDownloadDocument = async (documentId: number) => {
        try {
            const response = await apiGetDocumentDownloadUrl(documentId)
            window.open(response.url, '_blank', 'noopener,noreferrer')
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'Document download link could not be generated.')}
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    return (
        <Container>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3>Documents</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage company documents connected to Coredeck.
                        </p>
                    </div>
                    <Button onClick={() => mutate()}>Refresh</Button>
                </div>

                <DocumentsStats
                    total={data?.total ?? documents.length}
                    totalSize={totalSize}
                    visible={documents.length}
                />

                <AdaptiveCard>
                    <div className="mb-4 max-w-md">
                        <Input
                            placeholder="Search documents"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <Loading loading={isLoading}>
                        <DocumentsList
                            documents={documents}
                            onDownload={handleDownloadDocument}
                        />
                    </Loading>
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default Documents
