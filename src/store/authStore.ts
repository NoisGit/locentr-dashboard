import cookiesStorage from '@/utils/cookiesStorage'
import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/@types/auth'

type Session = {
  signedIn: boolean
}

type AuthState = {
  session: Session
  user: User
}

type AuthAction = {
  setSessionSignedIn: (payload: boolean) => void
  setUser: (payload: User) => void
  resetAuth: () => void
}

// Nombre para el refresh token (alínealo si ya tienes constante propia)
const REFRESH_TOKEN_NAME_IN_STORAGE = 'refresh_token'

const getPersistStorage = () => {
  if (appConfig.accessTokenPersistStrategy === 'localStorage') return localStorage
  if (appConfig.accessTokenPersistStrategy === 'sessionStorage') return sessionStorage
  return cookiesStorage
}

const initialState: AuthState = {
  session: { signedIn: false },
  user: {
    avatar: '',
    userName: '',
    email: '',
    authority: [],
  },
}

export const useSessionUser = create<AuthState & AuthAction>()(
  persist(
    (set) => ({
      ...initialState,
      setSessionSignedIn: (payload) =>
        set((state) => ({
          session: { ...state.session, signedIn: payload },
        })),
      setUser: (payload) =>
        set(() => ({
          user: { ...payload },
        })),
      resetAuth: () =>
        set(() => {
          // limpia tokens también
          const storage = getPersistStorage()
          try {
            storage.removeItem(TOKEN_NAME_IN_STORAGE)
            storage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)
          } catch {}
          return { ...initialState }
        }),
    }),
    {
      name: 'sessionUser',
      storage: createJSONStorage(() => getPersistStorage()),
    },
  ),
)

// Manejo de tokens (access + refresh)
export const useToken = () => {
  const storage = getPersistStorage()

  const setToken = (token: string) => {
    storage.setItem(TOKEN_NAME_IN_STORAGE, token) // ej: "Bearer <access_token>"
  }
  const getToken = () => storage.getItem(TOKEN_NAME_IN_STORAGE)

  const setRefreshToken = (token: string) => {
    storage.setItem(REFRESH_TOKEN_NAME_IN_STORAGE, token)
  }
  const getRefreshToken = () => storage.getItem(REFRESH_TOKEN_NAME_IN_STORAGE)

  const clearToken = () => {
    storage.removeItem(TOKEN_NAME_IN_STORAGE)
    storage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)
  }

  return {
    setToken,
    setRefreshToken,
    clearToken,
    token: getToken(),
    refreshToken: getRefreshToken(),
  }
}
