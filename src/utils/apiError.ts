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

const statusMessages: Record<number, string> = {
    400: 'La solicitud contiene datos inválidos.',
    401: 'Tu sesión no es válida. Inicia sesión nuevamente.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'El recurso solicitado no fue encontrado.',
    409: 'La operación entra en conflicto con un registro existente.',
    422: 'Revisa los campos enviados e intenta nuevamente.',
    429: 'Se realizaron demasiadas solicitudes. Intenta más tarde.',
    500: 'El servicio no pudo completar la operación.',
}

const knownMessages: Record<string, string> = {
    'Company not found.': 'La empresa no fue encontrada.',
    'User not found.': 'El usuario no fue encontrado.',
    'User not found': 'El usuario no fue encontrado.',
    'Email is already in use.': 'El correo ya está en uso.',
    'Username is already in use.': 'El nombre de usuario ya está en uso.',
    'Invalid credentials': 'Las credenciales no son válidas.',
    'Notification not found': 'La notificación no fue encontrada.',
    'Only .csv files are allowed.': 'Solo se permiten archivos CSV.',
    'CSV file is empty.': 'El archivo CSV está vacío.',
    'CSV file must be UTF-8 encoded.': 'El archivo CSV debe estar codificado en UTF-8.',
}

function readStatus(response?: Record<string, unknown>) {
    const status = Number(response?.status)
    return Number.isInteger(status) ? status : undefined
}

function translateMessage(message: string, status?: number) {
    if (!message) return status ? statusMessages[status] : ''
    if (knownMessages[message]) return knownMessages[message]
    const isAscii = Array.from(message).every(
        (character) => character.charCodeAt(0) <= 127,
    )
    if (status && statusMessages[status] && isAscii) {
        return statusMessages[status]
    }
    return message
}

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (!isRecord(error)) return fallback

    const response = isRecord(error.response) ? error.response : undefined
    const responseData = response && isRecord(response.data) ? response.data : undefined
    const status = readStatus(response)
    const message = readMessage(responseData) || readMessage(response) || readMessage(error)

    return translateMessage(message, status) || (status ? statusMessages[status] : '') || fallback
}
