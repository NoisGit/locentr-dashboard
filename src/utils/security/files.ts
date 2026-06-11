export const CSV_UPLOAD_MAX_BYTES = 5 * 1024 * 1024

const CSV_MIME_TYPES = new Set([
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'text/plain',
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
