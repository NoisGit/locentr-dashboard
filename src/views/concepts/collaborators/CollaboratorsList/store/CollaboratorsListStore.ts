// src/views/concepts/collaborators/CollaboratorsList/store/CollaboratorsListStore.ts
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

/* ========== Utils ========== */

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T) {
  if (a === b) return true
  const ak = Object.keys(a)
  const bk = Object.keys(b)
  if (ak.length !== bk.length) return false
  for (const k of ak) {
    // @ts-expect-error index
    if (a[k] !== b[k]) return false
  }
  return true
}

type Updater<T> = T | ((prev: T) => T)

/* ========== Estado + Acciones ========== */

export type CollaboratorsListState = {
  tableData: TableQueries
  filterData: Filter
  selectedCollaborator: Partial<Collaborator>[]
  selectedCollaborators: Collaborator[]
}

export type CollaboratorsListAction = {
  setFilterData: (payload: Updater<Filter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedCollaborator: (checked: boolean, row: Collaborator) => void
  setSelectAllCollaborators: (rows: Collaborator[]) => void
  setSelectedCollaborators: (rows: Collaborator[]) => void
  /** Útil para hacer un solo set cuando cambia la comunidad */
  resetForCommunity: () => void
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
>((set, get) => ({
  ...initialState,

  setFilterData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: Filter) => Filter)(state.filterData)
          : payload
      const merged = { ...state.filterData, ...next }
      if (shallowEqual(merged, state.filterData)) return state
      return { filterData: merged }
    }),

  setTableData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => TableQueries)(state.tableData)
          : payload

      // normalización simple
      const pageIndex = Math.max(1, Number(next.pageIndex ?? state.tableData.pageIndex))
      const pageSize  = Math.max(1, Number(next.pageSize  ?? state.tableData.pageSize))
      const merged: TableQueries = {
        ...state.tableData,
        ...next,
        pageIndex,
        pageSize,
      }

      if (shallowEqual(merged as Record<string, unknown>, state.tableData as Record<string, unknown>)) {
        return state
      }
      return { tableData: merged }
    }),

  setSelectedCollaborator: (checked, row) =>
    set((state) => {
      const current = Array.isArray(state.selectedCollaborators)
        ? state.selectedCollaborators
        : []
      const exists = current.some((r) => r.id === row.id)
      const next = checked
        ? (exists ? current : [...current, row])
        : current.filter((r) => r.id !== row.id)

      if (next === state.selectedCollaborators) return state
      return {
        selectedCollaborators: next,
        selectedCollaborator: next,
      }
    }),

  setSelectAllCollaborators: (rows) =>
    set((state) => {
      // evita sets iguales
      if (rows === state.selectedCollaborators) return state
      return {
        selectedCollaborators: rows,
        selectedCollaborator: rows,
      }
    }),

  setSelectedCollaborators: (rows) =>
    set((state) => {
      if (rows === state.selectedCollaborators) return state
      return {
        selectedCollaborators: rows,
        selectedCollaborator: rows,
      }
    }),

  resetForCommunity: () =>
    set((state) => {
      const nextTable = { ...state.tableData, pageIndex: 1 }
      if (
        shallowEqual(nextTable as Record<string, unknown>, state.tableData as Record<string, unknown>) &&
        state.selectedCollaborators.length === 0 &&
        state.selectedCollaborator.length === 0
      ) {
        return state
      }
      return {
        tableData: nextTable,
        selectedCollaborators: [],
        selectedCollaborator: [],
      }
    }),
}))
