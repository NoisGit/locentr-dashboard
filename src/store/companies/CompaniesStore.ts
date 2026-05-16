import { create } from 'zustand'
import type { Company } from '@/services/CompaniesService'

export type CompaniesSource = 'none' | 'all'

type CompaniesState = {
  companies: Company[]
  selectedId?: string | number
  selectedName?: string
  source: CompaniesSource
  autoSelected: boolean
}

type CompaniesActions = {
  setCompanies: (
    list: Company[],
    source?: Exclude<CompaniesSource, 'none'>,
    opts?: { autoSelectIfSingle?: boolean }
  ) => void
  selectCompany: (company: { id: string | number; name: string }) => void
  clearCompany: () => void
  ensureSelectionFromList: () => boolean
  reset: () => void
}

const STORAGE_KEY = 'current_company'

function readCompanyName(company: Company): string {
  return String(company.name || company.id || '')
}

function persistSelected(id?: string | number, name?: string) {
  try {
    if (id === undefined || id === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name }))
    }
  } catch {}
}

export function isVirtualCompanyId(id: unknown): id is string {
  return typeof id === 'string' && id.startsWith('__')
}

export const useCompaniesStore = create<CompaniesState & CompaniesActions>((set, get) => ({
  companies: [],
  selectedId: undefined,
  selectedName: undefined,
  source: 'none',
  autoSelected: false,

  setCompanies: (list, source, opts) => {
    const { selectedId } = get()
    const autoSelectIfSingle = opts?.autoSelectIfSingle ?? true
    const hasVirtual = isVirtualCompanyId(selectedId)

    if (list.length === 0) {
      set({ companies: [], source: source ?? get().source, autoSelected: false })
      if (hasVirtual) {
        persistSelected(undefined, undefined)
        set({ selectedId: undefined, selectedName: undefined })
      }
      return
    }

    const stillExists =
      selectedId !== undefined &&
      selectedId !== null &&
      !hasVirtual &&
      list.some((company) => String(company.id) === String(selectedId))

    if (!stillExists && autoSelectIfSingle && list.length === 1) {
      const only = list[0]
      const onlyName = readCompanyName(only)
      persistSelected(only.id, onlyName)
      set({
        companies: list,
        source: source ?? get().source,
        selectedId: only.id,
        selectedName: onlyName,
        autoSelected: true,
      })
      return
    }

    if (stillExists) {
      const current = list.find((company) => String(company.id) === String(selectedId))!
      const name = readCompanyName(current)
      persistSelected(current.id, name)
      set({
        companies: list,
        source: source ?? get().source,
        selectedName: name,
        autoSelected: false,
      })
      return
    }

    set({ companies: list, source: source ?? get().source, autoSelected: false })
    persistSelected(undefined, undefined)
    set({ selectedId: undefined, selectedName: undefined })
  },

  selectCompany: ({ id, name }) => {
    persistSelected(id, name)
    set({ selectedId: id, selectedName: name, autoSelected: false })
  },

  clearCompany: () => {
    persistSelected(undefined, undefined)
    set({ selectedId: undefined, selectedName: undefined, autoSelected: false })
  },

  ensureSelectionFromList: () => {
    const { selectedId, companies } = get()

    if (isVirtualCompanyId(selectedId)) {
      set({ autoSelected: false })
      return false
    }

    if ((selectedId === undefined || selectedId === null) && companies.length === 1) {
      const only = companies[0]
      const onlyName = readCompanyName(only)
      persistSelected(only.id, onlyName)
      set({ selectedId: only.id, selectedName: onlyName, autoSelected: true })
      return true
    }

    set({ autoSelected: false })
    return false
  },

  reset: () => {
    persistSelected(undefined, undefined)
    set({
      companies: [],
      selectedId: undefined,
      selectedName: undefined,
      source: 'none',
      autoSelected: false,
    })
  },
}))

export function hydrateCompaniesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as { id?: string | number; name?: string }
    if (parsed?.id !== undefined && parsed?.id !== null) {
      useCompaniesStore.getState().selectCompany({
        id: parsed.id,
        name: parsed.name ?? '',
      })
    }
  } catch {}
}
