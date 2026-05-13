export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
  enableMock: boolean
  activeNavTranslation: boolean
}

const apiPrefix = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')

const appConfig: AppConfig = {
  apiPrefix,
  authenticatedEntryPath: '/dashboards',
  unAuthenticatedEntryPath: '/auth/sign-in',
  locale: 'es',
  accessTokenPersistStrategy: 'localStorage',
  enableMock: false,
  activeNavTranslation: true,
}

export default appConfig
