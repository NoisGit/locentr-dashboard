export function formatNotificationDate(date?: string | null) {
    if (!date) return 'No date'

    return new Intl.DateTimeFormat('en', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}
