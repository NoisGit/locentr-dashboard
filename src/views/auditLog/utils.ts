export function formatAuditLogDate(date?: string | null) {
    if (!date) return 'Sin fecha'

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return 'Sin fecha'

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate)
}

export function normalizeAuditLabel(value?: string | null) {
    if (!value) return 'No informado'

    return value
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/^./, (char) => char.toUpperCase())
}
