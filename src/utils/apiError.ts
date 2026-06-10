function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function readMessage(value: unknown): string {
    if (typeof value === 'string') return value
    if (!isRecord(value)) return ''

    const direct = value.message ?? value.detail
    if (typeof direct === 'string') return direct

    return ''
}

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (!isRecord(error)) return fallback

    const response = isRecord(error.response) ? error.response : undefined
    const responseData =
        response && isRecord(response.data) ? response.data : undefined

    return (
        readMessage(responseData) ||
        readMessage(response) ||
        readMessage(error) ||
        fallback
    )
}
