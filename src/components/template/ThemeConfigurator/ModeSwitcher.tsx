import { useThemeStore } from '@/store/themeStore'
import { FiSun, FiMoon } from 'react-icons/fi'

const ModeSwitcher = () => {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  const isDark = mode === 'dark'

  return (
    <button
      aria-label="Cambiar modo claro/oscuro"
      className={`flex h-9 w-9 min-w-9 items-center justify-center rounded-xl border transition-colors
        ${
          isDark
            ? 'border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-primary/30 hover:text-primary'
        }`}
      onClick={() => setMode(isDark ? 'light' : 'dark')}
    >
      {isDark ? <FiMoon size={17} /> : <FiSun size={17} />}
    </button>
  )
}

export default ModeSwitcher
