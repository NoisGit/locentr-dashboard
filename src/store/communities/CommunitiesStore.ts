// src/store/communities/CommunitiesStore.ts
import { create } from 'zustand'
import type { Community } from '@/services/CommunitiesService'

export type CommunitiesSource = 'none' | 'mine' | 'all'

type CommunitiesState = {
  communities: Community[]
  selectedId?: string | number
  selectedName?: string
  source: CommunitiesSource
  /** true si la última carga de comunidades auto-seleccionó una sola comunidad */
  autoSelected: boolean
}

type CommunitiesActions = {
  /**
   * Establece la lista de comunidades. Si hay exactamente 1 y
   * `opts.autoSelectIfSingle !== false`, se auto-selecciona.
   * También limpia la selección si el seleccionado ya no existe.
   */
  setCommunities: (
    list: Community[],
    source?: Exclude<CommunitiesSource, 'none'>,
    opts?: { autoSelectIfSingle?: boolean }
  ) => void

  /** Selecciona y persiste en storage */
  selectCommunity: (c: { id: string | number; name: string }) => void

  /** Limpia selección y storage */
  clearCommunity: () => void

  /**
   * Si no hay selección y hay exactamente 1 comunidad en memoria,
   * la selecciona. Devuelve true si auto-seleccionó.
   */
  ensureSelectionFromList: () => boolean
}

const STORAGE_KEY = 'current_community'

function persistSelected(id?: string | number, name?: string) {
  try {
    if (id === undefined || id === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name }))
    }
  } catch {}
}

export const useCommunitiesStore = create<CommunitiesState & CommunitiesActions>((set, get) => ({
  communities: [],
  selectedId: undefined,
  selectedName: undefined,
  source: 'none',
  autoSelected: false,

  setCommunities: (list, source, opts) => {
    const { selectedId } = get()
    const autoSelectIfSingle = opts?.autoSelectIfSingle ?? true

    // ¿Sigue existiendo el seleccionado actual?
    const stillExists =
      selectedId !== undefined &&
      selectedId !== null &&
      list.some((c) => String(c.id) === String(selectedId))

    let didAutoSelect = false

    // Autoselect si hay 1 comunidad y se permite
    if (!stillExists && autoSelectIfSingle && list.length === 1) {
      const only = list[0]
      persistSelected(only.id, (only as any).name ?? '')
      set({
        communities: list,
        source: source ?? get().source,
        selectedId: only.id,
        selectedName: (only as any).name ?? '',
        autoSelected: true,
      })
      didAutoSelect = true
    } else {
      // Set básico
      set({
        communities: list,
        source: source ?? get().source,
        autoSelected: false,
      })
      // Si el seleccionado ya no existe, limpiamos
      if (!stillExists) {
        persistSelected(undefined, undefined)
        set({ selectedId: undefined, selectedName: undefined })
      }
    }

    // Valor de retorno vía estado (por si el consumidor quiere observarlo)
    if (didAutoSelect) {
      set({ autoSelected: true })
    }
  },

  selectCommunity: ({ id, name }) => {
    persistSelected(id, name)
    set({ selectedId: id, selectedName: name, autoSelected: false })
  },

  clearCommunity: () => {
    persistSelected(undefined, undefined)
    set({ selectedId: undefined, selectedName: undefined, autoSelected: false })
  },

  ensureSelectionFromList: () => {
    const { selectedId, communities } = get()
    if ((selectedId === undefined || selectedId === null) && communities.length === 1) {
      const only = communities[0]
      persistSelected(only.id, (only as any).name ?? '')
      set({
        selectedId: only.id,
        selectedName: (only as any).name ?? '',
        autoSelected: true,
      })
      return true
    }
    set({ autoSelected: false })
    return false
  },
}))

export function hydrateCommunitiesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as { id?: string | number; name?: string }
    if (parsed?.id !== undefined && parsed?.id !== null) {
      useCommunitiesStore
        .getState()
        .selectCommunity({ id: parsed.id, name: parsed.name ?? '' })
    }
  } catch {}
}
