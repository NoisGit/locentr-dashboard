import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatDocumentDate, formatFileSize } from '../utils'
import type { DocumentResponse } from '@/services/DocumentsService'

type DocumentsListProps = {
    documents: DocumentResponse[]
    onDownload: (documentId: number) => void
}

const DocumentsList = ({ documents, onDownload }: DocumentsListProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div>
                    <h5>Documents</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Company files stored in Coredeck.
                    </p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {documents.map((document) => (
                        <div
                            key={document.id}
                            className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="font-medium">{document.name}</div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {document.file_name} · {formatFileSize(document.size_bytes)} · {formatDocumentDate(document.created_at)}
                                </div>
                                {document.comment ? (
                                    <div className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                        {document.comment}
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => onDownload(document.id)}
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    ))}

                    {documents.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            No documents found.
                        </div>
                    ) : null}
                </div>
            </div>
        </Card>
    )
}

export default DocumentsList
