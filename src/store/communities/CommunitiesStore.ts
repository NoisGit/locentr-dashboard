// src/store/communities/CommunitiesStore.ts
import { create } from 'zustand'
import type { Community } from '@/services/CommunitiesService'

type CommunitiesState = {
  communities: Community[]
  selectedId?: string | number
  selectedName?: string
}

type CommunitiesActions = {
  setCommunities: (list: Community[]) => void
  selectCommunity: (c: { id: string | number; name: string }) => void
  clearCommunity: () => void
}

const STORAGE_KEY = 'current_community'

export const useCommunitiesStore = create<CommunitiesState & CommunitiesActions>((set) => ({
  communities: [],
  selectedId: undefined,
  selectedName: undefined,

  setCommunities: (list) => set({ communities: list }),

  selectCommunity: ({ id, name }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name }))
    } catch (e) {
      void e
    }
    set({ selectedId: id, selectedName: name })
  },

  clearCommunity: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      void e
    }
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
  } catch (e) {
    void e
  }
}
