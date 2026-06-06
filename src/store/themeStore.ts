import { themeConfig } from '@/configs/theme.config'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, Direction } from '@/@types/theme'

type ThemeState = Theme

type ThemeAction = {
    setSchema: (payload: string) => void
    setMode: (payload: ThemeState['mode']) => void
    setSideNavCollapse: (payload: boolean) => void
    setDirection: (payload: Direction) => void
    setPanelExpand: (payload: boolean) => void
}

const ACTIVE_LAYOUT = themeConfig.layout.type

function normalizeThemeState(state: ThemeState): ThemeState {
    return {
        ...state,
        layout: {
            ...state.layout,
            type: ACTIVE_LAYOUT,
            previousType: '',
        },
    }
}

export const useThemeStore = create<ThemeState & ThemeAction>()(
    persist(
        (set) => ({
            ...normalizeThemeState(themeConfig),
            setSchema: (payload) => set(() => ({ themeSchema: payload })),
            setMode: (payload) => set(() => ({ mode: payload })),
            setSideNavCollapse: (payload) =>
                set((state) => ({
                    layout: { ...state.layout, type: ACTIVE_LAYOUT, sideNavCollapse: payload },
                })),
            setDirection: (payload) => set(() => ({ direction: payload })),
            setPanelExpand: (payload) => set(() => ({ panelExpand: payload })),
        }),
        {
            name: 'theme',
            merge: (persisted, current) =>
                normalizeThemeState({
                    ...current,
                    ...(persisted as Partial<ThemeState>),
                    layout: {
                        ...current.layout,
                        ...((persisted as Partial<ThemeState>)?.layout ?? {}),
                    },
                }),
        },
    ),
)
