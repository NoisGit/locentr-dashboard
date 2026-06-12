import { useMemo, useState } from 'react'
import useSWR from 'swr'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { Role } from '@/utils/rbac/types'
import {
    apiCreateDocument,
    apiCreateDocumentUploadIntent,
    apiDeleteDocument,
    apiGetDocumentDownloadUrl,
    apiUpdateDocument,
} from '@/services/DocumentsService'
import {
    apiDownloadPrivateDocument,
    apiUploadPrivateDocument,
} from '@/services/StorageService'
import {
    apiGetCompaniesPage,
    filterCompaniesForUser,
} from '@/services/CompaniesService'
import { validateDocumentUpload } from '@/utils/security/files'
import DocumentsList from './components/DocumentsList'
import DocumentsStats from './components/DocumentsStats'
import { useDocuments } from './hooks/useDocuments'
import { getApiErrorMessage } from '@/utils/apiError'
import type { DocumentResponse } from '@/services/DocumentsService'

const Documents = () => {
    const user = useSessionUser((state) => state.user)
    const role = user.role
    const isSuperAdmin = role === Role.SUPERADMIN
    const [search, setSearch] = useState('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [showUpload, setShowUpload] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [documentName, setDocumentName] = useState('')
    const [comment, setComment] = useState('')
    const [companyId, setCompanyId] = useState(
        user.company_id ? String(user.company_id) : '',
    )
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [fileInputKey, setFileInputKey] = useState(0)
    const { data, isLoading, mutate } = useDocuments({
        isSuperAdmin,
        search,
        pageIndex,
        pageSize,
    })
    const { data: companiesPage } = useSWR(
        isSuperAdmin ? 'documents:companies' : null,
        () => apiGetCompaniesPage({ pageIndex: 1, pageSize: 200 }),
        { revalidateOnFocus: false },
    )
    const companies = useMemo(
        () =>
            filterCompaniesForUser(
                companiesPage?.items ?? [],
                role,
                user.company_id,
            ),
        [companiesPage?.items, role, user.company_id],
    )
    const documents = useMemo(() => data?.items ?? [], [data?.items])
    const total = data?.total ?? 0
    const totalSize = useMemo(
        () =>
            documents.reduce(
                (totalBytes, document) =>
                    totalBytes + (document.size_bytes ?? 0),
                0,
            ),
        [documents],
    )

    const notifyError = (error: unknown, fallback: string) => {
        toast.push(
            <Notification type="danger">
                {getApiErrorMessage(error, fallback)}
            </Notification>,
            { placement: 'top-center' },
        )
    }

    const resetUploadForm = () => {
        setFile(null)
        setDocumentName('')
        setComment('')
        setUploadProgress(0)
        setFileInputKey((value) => value + 1)
    }

    const uploadFile = async (targetCompanyId: number, targetFile: File) => {
        const validationError = validateDocumentUpload(targetFile)
        if (validationError) throw new Error(validationError)

        const intent = await apiCreateDocumentUploadIntent({
            company_id: targetCompanyId,
            file_name: targetFile.name,
            content_type: targetFile.type,
            size_bytes: targetFile.size,
        })
        await apiUploadPrivateDocument(
            intent.upload_url,
            targetFile,
            setUploadProgress,
        )
        return intent.object_name
    }

    const handleCreateDocument = async () => {
        const numericCompanyId = Number(companyId)
        const validationError = validateDocumentUpload(file)
        if (!numericCompanyId) {
            notifyError(null, 'Selecciona una empresa.')
            return
        }
        if (validationError || !file) {
            notifyError(null, validationError || 'Selecciona un documento.')
            return
        }

        setIsUploading(true)
        try {
            const objectName = await uploadFile(numericCompanyId, file)
            await apiCreateDocument({
                company_id: numericCompanyId,
                name: documentName.trim() || file.name,
                file_name: file.name,
                blob_name: objectName,
                content_type: file.type,
                size_bytes: file.size,
                comment: comment.trim() || null,
            })
            resetUploadForm()
            setShowUpload(false)
            await mutate()
            toast.push(
                <Notification type="success">
                    Documento almacenado de forma privada.
                </Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            notifyError(error, 'No se pudo subir el documento.')
        } finally {
            setIsUploading(false)
        }
    }

    const downloadFromFreshUrl = async (documentId: number) => {
        const response = await apiGetDocumentDownloadUrl(documentId)
        return apiDownloadPrivateDocument(response.url)
    }

    const handleDownloadDocument = async (document: DocumentResponse) => {
        try {
            let blob: Blob
            try {
                blob = await downloadFromFreshUrl(document.id)
            } catch {
                blob = await downloadFromFreshUrl(document.id)
            }
            const objectUrl = URL.createObjectURL(blob)
            const anchor = window.document.createElement('a')
            anchor.href = objectUrl
            anchor.download = document.file_name
            anchor.click()
            URL.revokeObjectURL(objectUrl)
        } catch (error) {
            notifyError(error, 'No se pudo descargar el documento.')
        }
    }

    const handleReplaceDocument = async (
        document: DocumentResponse,
        replacement: File,
    ) => {
        setIsUploading(true)
        setUploadProgress(0)
        try {
            const objectName = await uploadFile(
                document.company_id,
                replacement,
            )
            await apiUpdateDocument(document.id, {
                file_name: replacement.name,
                blob_name: objectName,
                content_type: replacement.type,
                size_bytes: replacement.size,
            })
            await mutate()
            toast.push(
                <Notification type="success">Documento reemplazado.</Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            notifyError(error, 'No se pudo reemplazar el documento.')
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const handleDeleteDocument = async (document: DocumentResponse) => {
        if (!window.confirm(`¿Eliminar "${document.name}" definitivamente?`)) {
            return
        }
        try {
            await apiDeleteDocument(document.id)
            await mutate()
            toast.push(
                <Notification type="success">Documento eliminado.</Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            notifyError(error, 'No se pudo eliminar el documento.')
        }
    }

    return (
        <Container>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3>Documentos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Archivos privados asociados a cada empresa.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setShowUpload((value) => !value)}>
                            {showUpload ? 'Cancelar carga' : 'Subir documento'}
                        </Button>
                        <Button onClick={() => mutate()}>Actualizar</Button>
                    </div>
                </div>

                {showUpload ? (
                    <AdaptiveCard>
                        <div className="grid gap-4 md:grid-cols-2">
                            {isSuperAdmin ? (
                                <label className="flex flex-col gap-2 text-sm">
                                    Empresa
                                    <select
                                        className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-600"
                                        value={companyId}
                                        onChange={(event) =>
                                            setCompanyId(event.target.value)
                                        }
                                    >
                                        <option value="">Seleccionar empresa</option>
                                        {companies.map((company) => (
                                            <option
                                                key={company.id}
                                                value={company.id}
                                            >
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : null}
                            <label className="flex flex-col gap-2 text-sm">
                                Archivo
                                <input
                                    key={fileInputKey}
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(event) =>
                                        setFile(event.target.files?.[0] ?? null)
                                    }
                                />
                            </label>
                            <Input
                                placeholder="Nombre visible"
                                value={documentName}
                                onChange={(event) =>
                                    setDocumentName(event.target.value)
                                }
                            />
                            <Input
                                placeholder="Comentario opcional"
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                            />
                        </div>
                        {isUploading ? (
                            <p className="mt-3 text-sm">
                                Subiendo archivo privado: {uploadProgress}%
                            </p>
                        ) : null}
                        <div className="mt-4 flex justify-end">
                            <Button
                                loading={isUploading}
                                disabled={isUploading}
                                onClick={handleCreateDocument}
                            >
                                Guardar documento
                            </Button>
                        </div>
                    </AdaptiveCard>
                ) : null}

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
                            onChange={(event) => {
                                setSearch(event.target.value)
                                setPageIndex(1)
                            }}
                        />
                    </div>

                    <DocumentsList
                        documents={documents}
                        isLoading={isLoading}
                        isMutating={isUploading}
                        total={total}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        onDownload={handleDownloadDocument}
                        onReplace={handleReplaceDocument}
                        onDelete={handleDeleteDocument}
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
