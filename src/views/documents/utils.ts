export function formatFileSize(size?: number | null) {
    if (!size) return 'Unknown size'

    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

    return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function formatDocumentDate(date?: string | null) {
    if (!date) return 'No date'

    return new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}
