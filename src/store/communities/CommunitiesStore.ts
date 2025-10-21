// src/store/communities/CommunitiesStore.ts
import { create } from 'zustand'
import type { Community } from '@/services/CommunitiesService'

export type CommunitiesSource = 'none' | 'mine' | 'all'

type CommunitiesState = {
  communities: Community[]
  selectedId?: string | number
  selectedName?: string
  source: CommunitiesSource
  autoSelected: boolean
}

type CommunitiesActions = {
  setCommunities: (
    list: Community[],
    source?: Exclude<CommunitiesSource, 'none'>,
    opts?: { autoSelectIfSingle?: boolean }
  ) => void
  selectCommunity: (c: { id: string | number; name: string }) => void
  clearCommunity: () => void
  ensureSelectionFromList: () => boolean
  reset: () => void
}

const STORAGE_KEY = 'current_community'

type NameLike = {
  name?: string
  full_name?: string
  title?: string
  community_name?: string
  label?: string
}

function readCommunityName(c: Community): string {
  const n =
    (c as unknown as NameLike).name ??
    (c as unknown as NameLike).full_name ??
    (c as unknown as NameLike).title ??
    (c as unknown as NameLike).community_name ??
    (c as unknown as NameLike).label ??
    ''
  return String(n)
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

/** Helper público: selección virtual (p.ej. SUPERADMIN) => id que empieza por "__" */
export function isVirtualCommunityId(id: unknown): id is string {
  return typeof id === 'string' && id.startsWith('__')
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

    // No mantener selecciones virtuales al recibir nueva lista
    // Las selecciones virtuales deben ser manejadas por SecureRoutesWithCommunities
    const hasVirtual = isVirtualCommunityId(selectedId)

    if (list.length === 0) {
      set({
        communities: [],
        source: source ?? get().source,
        autoSelected: false,
      })
      // Limpiar selección virtual si existe
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
      list.some((c) => String(c.id) === String(selectedId))

    if (!stillExists && autoSelectIfSingle && list.length === 1) {
      const only = list[0]
      const onlyName = readCommunityName(only)
      persistSelected(only.id, onlyName)
      set({
        communities: list,
        source: source ?? get().source,
        selectedId: only.id,
        selectedName: onlyName,
        autoSelected: true,
      })
      return
    }

    if (stillExists) {
      const current = list.find((c) => String(c.id) === String(selectedId))!
      const name = readCommunityName(current)
      persistSelected(current.id, name)
      set({
        communities: list,
        source: source ?? get().source,
        selectedName: name,
        autoSelected: false,
      })
      return
    }

    // Selección actual ya no existe y no es virtual
    set({
      communities: list,
      source: source ?? get().source,
      autoSelected: false,
    })
    persistSelected(undefined, undefined)
    set({ selectedId: undefined, selectedName: undefined })
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

    // No auto-seleccionar si hay una selección virtual
    if (isVirtualCommunityId(selectedId)) {
      set({ autoSelected: false })
      return false
    }

    if ((selectedId === undefined || selectedId === null) && communities.length === 1) {
      const only = communities[0]
      const onlyName = readCommunityName(only)
      persistSelected(only.id, onlyName)
      set({
        selectedId: only.id,
        selectedName: onlyName,
        autoSelected: true,
      })
      return true
    }
    set({ autoSelected: false })
    return false
  },

  reset: () => {
    persistSelected(undefined, undefined)
    set({
      communities: [],
      selectedId: undefined,
      selectedName: undefined,
      source: 'none',
      autoSelected: false,
    })
  },
}))

export function hydrateCommunitiesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as { id?: string | number; name?: string }
    if (parsed?.id !== undefined && parsed?.id !== null) {
      useCommunitiesStore.getState().selectCommunity({
        id: parsed.id,
        name: parsed.name ?? '',
      })
    }
  } catch {}
}
