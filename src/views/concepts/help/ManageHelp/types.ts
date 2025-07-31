export type HelpReply = {
    author: string
    message: string
    date: string
}

export type HelpTicket = {
    id: string
    email: string
    subject: string
    message: string
    status: 'pending' | 'in_progress' | 'resolved'
    acceptTerms?: boolean
    createdAt: string
    updateTime: string
    updateTimeStamp: number
    respondedBy?: {
        name: string
        img?: string
    }
    replies?: HelpReply[]
}

// ✅ Para usar en el store y selects múltiples
export type HelpTickets = HelpTicket[]

// ✅ Filtro de estado (Zustand y APIs)
export type HelpFilter = {
    status: Array<'pending' | 'in_progress' | 'resolved'>
}

// ✅ Respuesta paginada desde la fake API
export type GetHelpListResponse = {
    list: HelpTicket[]
    total: number
}
