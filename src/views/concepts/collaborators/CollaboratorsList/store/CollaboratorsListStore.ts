import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'

/* ========== Tipos ========== */

export type Collaborator = {
  id: string | number
  name: string
  email?: string
  phone?: string
  role?: string
  community?: string
  active?: boolean
}

export type Filter = {
  /** Filtrado por comunidad (desde el selector del header también llega) */
  communityId: number | ''
  /** Opcional: filtrar por rol (Admin, Subadmin, Conserje, Guardia, etc.) */
  role?: string | ''
  /** Opcional: activo / inactivo */
  active?: boolean | ''
}

/* ========== Estados iniciales ========== */

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: { key: 'id', order: 'desc' },
}

export const initialFilterData: Filter = {
  communityId: '',
  role: '',
  active: '',
}

/* ========== Estado + Acciones ========== */

export type CollaboratorsListState = {
  tableData: TableQueries
  filterData: Filter
  selectedCollaborator: Partial<Collaborator>[]   // para detalle/edición rápida
  selectedCollaborators: Collaborator[]           // selección múltiple (borrar en lote)
}

type Updater<T> = T | ((prev: T) => T)

export type CollaboratorsListAction = {
  setFilterData: (payload: Updater<Filter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedCollaborator: (checked: boolean, row: Collaborator) => void
  setSelectAllCollaborators: (rows: Collaborator[]) => void
  setSelectedCollaborators: (rows: Collaborator[]) => void
}

const initialState: CollaboratorsListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedCollaborator: [],
  selectedCollaborators: [],
}

/* ========== Store ========== */

export const useCollaboratorsListStore = create<
  CollaboratorsListState & CollaboratorsListAction
>((set) => ({
  ...initialState,

  setFilterData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: Filter) => Filter)(state.filterData)
          : payload
      return { filterData: { ...state.filterData, ...next } }
    }),

  setTableData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => TableQueries)(state.tableData)
          : payload
      return { tableData: { ...state.tableData, ...next } }
    }),

  setSelectedCollaborator: (checked, row) =>
    set((state) => {
      const current = Array.isArray(state.selectedCollaborators)
        ? state.selectedCollaborators
        : []
      const exists = current.some((r) => r.id === row.id)
      const next = checked
        ? exists
          ? current
          : [...current, row]
        : current.filter((r) => r.id !== row.id)
      return {
        selectedCollaborators: next,
        selectedCollaborator: next,
      }
    }),

  setSelectAllCollaborators: (rows) =>
    set(() => ({
      selectedCollaborators: rows,
      selectedCollaborator: rows,
    })),

  setSelectedCollaborators: (rows) =>
    set(() => ({
      selectedCollaborators: rows,
      selectedCollaborator: rows,
    })),
}))
