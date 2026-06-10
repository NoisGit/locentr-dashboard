export function formatFileSize(size?: number | null) {
    if (size === undefined || size === null || size < 0) return 'No informado'
    if (size === 0) return '0 B'

    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

    return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function formatDocumentDate(date?: string | null) {
    if (!date) return 'Sin fecha'

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return 'Sin fecha'

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate)
}
