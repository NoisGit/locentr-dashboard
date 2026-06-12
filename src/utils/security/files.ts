export const CSV_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const DOCUMENT_UPLOAD_MAX_BYTES = 10 * 1024 * 1024

const CSV_MIME_TYPES = new Set([
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'text/plain',
])

const DOCUMENT_MIME_TYPES = new Map([
    ['application/pdf', '.pdf'],
    ['image/png', '.png'],
    ['image/jpeg', '.jpg'],
])

export function validateCsvUpload(file?: File | null): string | null {
    if (!file) return 'Selecciona un archivo CSV.'
    if (!file.name.toLowerCase().endsWith('.csv')) {
        return 'Solo se permiten archivos con extensión .csv.'
    }
    if (file.size === 0) return 'El archivo CSV está vacío.'
    if (file.size > CSV_UPLOAD_MAX_BYTES) {
        return 'El archivo CSV no puede superar 5 MB.'
    }
    if (file.type && !CSV_MIME_TYPES.has(file.type.toLowerCase())) {
        return 'El tipo de archivo no corresponde a un CSV válido.'
    }

    return null
}

export function assertCsvUpload(file: File) {
    const validationError = validateCsvUpload(file)
    if (validationError) throw new Error(validationError)
}

export function validateDocumentUpload(file?: File | null): string | null {
    if (!file) return 'Selecciona un documento.'
    if (file.size === 0) return 'El documento está vacío.'
    if (file.size > DOCUMENT_UPLOAD_MAX_BYTES) {
        return 'El documento no puede superar 10 MB.'
    }

    const expectedExtension = DOCUMENT_MIME_TYPES.get(file.type.toLowerCase())
    const normalizedName = file.name.toLowerCase()
    const hasValidExtension =
        expectedExtension === '.jpg'
            ? normalizedName.endsWith('.jpg') ||
              normalizedName.endsWith('.jpeg')
            : Boolean(expectedExtension && normalizedName.endsWith(expectedExtension))

    if (!expectedExtension || !hasValidExtension) {
        return 'Solo se permiten PDF, PNG, JPG o JPEG válidos.'
    }

    return null
}
