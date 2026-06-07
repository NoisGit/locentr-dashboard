import { useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { Role } from '@/utils/rbac/types'
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
    const isSuperAdmin = role === Role.SUPERADMIN
    const [search, setSearch] = useState('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { data, isLoading, mutate } = useDocuments({
        isSuperAdmin,
        search,
        pageIndex,
        pageSize,
    })
    const documents = useMemo(() => data?.items ?? [], [data?.items])
    const total = data?.total ?? 0
    const totalSize = useMemo(
        () => documents.reduce((totalBytes, document) => totalBytes + (document.size_bytes ?? 0), 0),
        [documents],
    )

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPageIndex(1)
    }

    const handleDownloadDocument = async (documentId: number) => {
        try {
            const response = await apiGetDocumentDownloadUrl(documentId)
            window.open(response.url, '_blank', 'noopener,noreferrer')
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'No se pudo generar el enlace de descarga.')}
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
                        <h3>Documentos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Administra documentos asociados a empresas y ubicaciones.
                        </p>
                    </div>
                    <Button onClick={() => mutate()}>Actualizar</Button>
                </div>

                <DocumentsStats
                    total={total}
                    totalSize={totalSize}
                    visible={documents.length}
                />

                <AdaptiveCard>
                    <div className="mb-4 max-w-md">
                        <Input
                            placeholder="Buscar documentos"
                            value={search}
                            onChange={(event) => handleSearchChange(event.target.value)}
                        />
                    </div>

                    <DocumentsList
                        documents={documents}
                        isLoading={isLoading}
                        total={total}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        onDownload={handleDownloadDocument}
                        onPaginationChange={setPageIndex}
                        onSelectChange={(value) => {
                            setPageSize(Number(value))
                            setPageIndex(1)
                        }}
                    />
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default Documents
