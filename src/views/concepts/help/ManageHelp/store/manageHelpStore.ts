import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { HelpTicket, HelpTickets, HelpFilter } from '../types'

// --- Initial states ---
export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        key: '',
        order: '',
    },
}

export const initialFilterData: HelpFilter = {
    status: ['pending', 'in_progress', 'resolved'],
}

// --- Store types ---
export type ManageHelpState = {
    tableData: TableQueries
    filterData: HelpFilter
    selectedTicket: Partial<HelpTicket>[]
}

export type ManageHelpAction = {
    setFilterData: (payload: HelpFilter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedTicket: (checked: boolean, ticket: HelpTicket) => void
    setSelectAllTickets: (tickets: HelpTickets) => void
}

// --- Initial state ---
const initialState: ManageHelpState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedTicket: [],
}

// --- Zustand store ---
export const useManageHelpStore = create<ManageHelpState & ManageHelpAction>()((set) => ({
    ...initialState,

    setFilterData: (payload) =>
        set(() => ({
            filterData: payload,
        })),

    setTableData: (payload) =>
        set(() => ({
            tableData: payload,
        })),

    setSelectedTicket: (checked, ticket) =>
        set((state) => ({
            selectedTicket: checked
                ? [...state.selectedTicket, ticket]
                : state.selectedTicket.filter((t) => t.id !== ticket.id),
        })),

    setSelectAllTickets: (tickets) =>
        set(() => ({
            selectedTicket: tickets,
        })),
}))
