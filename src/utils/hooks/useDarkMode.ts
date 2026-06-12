import { useEffect } from 'react'
import { THEME_ENUM } from '@/constants/theme.constant'
import { useThemeStore } from '@/store/themeStore'
import type { Mode } from '@/@types/theme'

function useDarkMode(): [
    isEnabled: boolean,
    onModeChange: (mode: Mode) => void,
] {
    const mode = useThemeStore((state) => state.mode)
    const setMode = useThemeStore((state) => state.setMode)

    const { MODE_DARK, MODE_LIGHT } = THEME_ENUM

    const isEnabled = mode === MODE_DARK

    const onModeChange = (mode: Mode) => {
        setMode(mode)
    }

    useEffect(() => {
        // Evita cualquier ejecución del código en SSR (Next, etc)
        if (typeof window === 'undefined') return

        const root = window.document.documentElement
        // Evita agregar la misma clase repetida
        if (isEnabled) {
            root.classList.add(MODE_DARK)
            root.classList.remove(MODE_LIGHT)
        } else {
            root.classList.add(MODE_LIGHT)
            root.classList.remove(MODE_DARK)
        }
    }, [isEnabled, MODE_DARK, MODE_LIGHT])

    return [isEnabled, onModeChange]
}

export default useDarkMode
