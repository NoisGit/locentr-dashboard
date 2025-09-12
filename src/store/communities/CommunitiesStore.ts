// src/store/communities/CommunitiesStore.ts
import { create } from 'zustand'
import type { Community } from '@/services/CommunitiesService'

export type CommunitiesSource = 'none' | 'mine' | 'all'

type CommunitiesState = {
  communities: Community[]
  selectedId?: string | number
  selectedName?: string
  source: CommunitiesSource
}

type CommunitiesActions = {
  setCommunities: (list: Community[], source?: Exclude<CommunitiesSource, 'none'>) => void
  selectCommunity: (c: { id: string | number; name: string }) => void
  clearCommunity: () => void
}

const STORAGE_KEY = 'current_community'

export const useCommunitiesStore = create<CommunitiesState & CommunitiesActions>((set) => ({
  communities: [],
  selectedId: undefined,
  selectedName: undefined,
  source: 'none',

  setCommunities: (list, source) =>
    set((s) => ({
      communities: list,
      source: source ?? s.source,
    })),

  selectCommunity: ({ id, name }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name }))
    } catch {}
    set({ selectedId: id, selectedName: name })
  },

  clearCommunity: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    set({ selectedId: undefined, selectedName: undefined })
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
