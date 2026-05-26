import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type {
    DocumentResponse,
    PaginatedResponse,
} from '@/services/DocumentsService'

type WorkspaceDocumentsTabProps = {
    documents?: PaginatedResponse<DocumentResponse>
    hasCompanyContext: boolean
    onDownload: (documentId: number) => void
}

function formatFileSize(size?: number | null) {
    if (!size) return 'Unknown size'

    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

    return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(date?: string | null) {
    if (!date) return 'No date'

    return new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

const WorkspaceDocumentsTab = ({
    documents,
    hasCompanyContext,
    onDownload,
}: WorkspaceDocumentsTabProps) => {
    const visibleDocuments = documents?.items?.slice(0, 5) ?? []
    const total = documents?.total ?? visibleDocuments.length

    return (
        <Card>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h5>Documents</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Company documents available for this workspace.
                        </p>
                    </div>
                    <div className="text-sm font-semibold">{total} total</div>
                </div>

                {!hasCompanyContext ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        This workspace has no company context yet. Assign a company to show its documents.
                    </div>
                ) : null}

                {hasCompanyContext ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {visibleDocuments.map((document) => (
                            <div
                                key={document.id}
                                className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <div className="font-medium">{document.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {document.file_name} · {formatFileSize(document.size_bytes)} · {formatDate(document.created_at)}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => onDownload(document.id)}
                                >
                                    Download
                                </Button>
                            </div>
                        ))}

                        {visibleDocuments.length === 0 ? (
                            <div className="text-sm text-gray-500">No documents found.</div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </Card>
    )
}

export default WorkspaceDocumentsTab
