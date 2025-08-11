export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
  enableMock: boolean
  activeNavTranslation: boolean
}

const appConfig: AppConfig = {
  apiPrefix: 'https://dev-api-residencial-dvhndhdqh8eeazgy.brazilsouth-01.azurewebsites.net',
  authenticatedEntryPath: '/dashboards',
  unAuthenticatedEntryPath: '/auth/sign-in',
  locale: 'es',
  accessTokenPersistStrategy: 'localStorage',
  enableMock: false, 
  activeNavTranslation: true,
}

export default appConfig
