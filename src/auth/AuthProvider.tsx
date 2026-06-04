import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useSWRConfig } from 'swr'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { apiMe, apiSignIn, apiSignOut } from '@/services/AuthService'
import { normalizeUser } from '@/services/UsersService'
import { apiListCompanies } from '@/services/CompaniesService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import { RBAC, Role } from '@/utils/rbac'
import type {
  SignInCredential,
  AuthResult,
  OauthSignInCallbackPayload,
  User as AppUser,
  Token,
} from '@/@types/auth'
import type { ReactNode } from 'react'

type AuthProviderProps = { children: ReactNode }
export type IsolatedNavigatorRef = { navigate: ReturnType<typeof useNavigate> }

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>(function IsolatedNavigator(_, ref) {
  const navigate = useNavigate()
  useImperativeHandle(ref, () => ({ navigate }), [navigate])
  return null
})

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function ensureBearerPrefix(token: string, tokenType?: string): string {
  const type = tokenType && tokenType.trim() ? tokenType : 'Bearer'
  const finalType = /^bearer$/i.test(type) ? 'Bearer' : type
  if (/^bearer\s+/i.test(token)) return token
  return `${finalType} ${token}`.trim()
}

function hasAppAccess(user: unknown): boolean {
  const rbacUser = RBAC.createAuthUser(user)
  if (!rbacUser) return false

  return RBAC.hasAnyRole(rbacUser, [
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.OPERATOR,
    Role.CLIENT,
  ])
}

function AuthProvider({ children }: AuthProviderProps) {
  const signedIn = useSessionUser((s) => s.session.signedIn)
  const user = useSessionUser((s) => s.user)
  const setUser = useSessionUser((s) => s.setUser)
  const setSessionSignedIn = useSessionUser((s) => s.setSessionSignedIn)
  const { token, setToken, setRefreshToken, clearToken } = useToken()
  const authenticated = Boolean(token)

  const { setCompanies, reset: resetCompanies } = useCompaniesStore()
  const { mutate, cache } = useSWRConfig()

  const navigatorRef = useRef<IsolatedNavigatorRef>(null)
  const hydratingRef = useRef(false)
  const prefetchedRef = useRef(false)

  const resetPerUserState = async () => {
    try { resetCompanies() } catch { }
    try { (cache as unknown as { clear?: () => void })?.clear?.() } catch { }
    await mutate(
      (key) =>
        Array.isArray(key) &&
        (key[0] === 'companies:list' || key[0] === 'news:list' || key[0] === 'news:detail'),
      undefined,
      { revalidate: false },
    )
  }

  const redirect = () => {
    const params = new URLSearchParams(window.location.search)
    const redirectUrl = params.get(REDIRECT_URL_KEY)
    navigatorRef.current?.navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath, {
      replace: true,
    })
  }

  const prefetchCompaniesOnce = async () => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    try {
      const list = await apiListCompanies({ pageIndex: 1, pageSize: 200 })
      setCompanies(list, 'all', { autoSelectIfSingle: true })
    } catch { }
  }

  const handleSignIn = (tokens: Token, u?: AppUser) => {
    setToken(tokens.accessToken)
    if (tokens.refreshToken) {
      setRefreshToken(tokens.refreshToken)
    }
    setSessionSignedIn(true)

    if (u) {
      const normalized = normalizeUser(u)
      const rbacUser = RBAC.createAuthUser(normalized)

      if (rbacUser) {
        setUser(rbacUser as AppUser)
      } else {
        setUser(normalized as AppUser)
      }

      void prefetchCompaniesOnce()
      return
    }

    setUser({ userName: '', email: '', avatar: '', role: null, permissions: [] } as AppUser)
  }

  const handleSignOut = () => {
    try {
      sessionStorage.setItem('__isLoggingOut', 'true')
    } catch { }

    clearToken()
    setUser({ userName: '', email: '', avatar: '', role: null, permissions: [] } as AppUser)
    setSessionSignedIn(false)
    prefetchedRef.current = false
    void resetPerUserState()
  }

  const hydrateUserFromApi = async () => {
    if (hydratingRef.current) return
    hydratingRef.current = true
    try {
      const me = await apiMe<unknown>()
      const normalized = normalizeUser(me)
      const rbacUser = RBAC.createAuthUser(normalized)

      if (rbacUser) {
        setUser(rbacUser as unknown as AppUser)
      } else {
        setUser(normalized as unknown as AppUser)
      }

      void prefetchCompaniesOnce()
    } finally {
      hydratingRef.current = false
    }
  }

  const signIn = async (values: SignInCredential): AuthResult => {
    try {
      const resp = await apiSignIn(values)
      const rawToken =
        toStr((resp as Record<string, unknown>)?.token) ||
        toStr((resp as Record<string, unknown>)?.access_token) ||
        toStr((resp as Record<string, unknown>)?.accessToken)

      if (!rawToken) {
        return { status: 'failed', message: 'No fue posible iniciar sesión' }
      }

      const tokenType =
        toStr((resp as Record<string, unknown>)?.token_type) ||
        toStr((resp as Record<string, unknown>)?.tokenType)
      const rawRefreshToken =
        toStr((resp as Record<string, unknown>)?.refresh_token) ||
        toStr((resp as Record<string, unknown>)?.refreshToken)
      const headerToken = ensureBearerPrefix(rawToken, tokenType)
      let userLike: unknown =
        (resp as Record<string, unknown>)?.user ??
        (resp as Record<string, unknown>)?.data

      if (!userLike) {
        setToken(headerToken)
        if (rawRefreshToken) {
          setRefreshToken(rawRefreshToken)
        }
        try {
          userLike = await apiMe<unknown>()
        } catch { }
      }

      if (!hasAppAccess(userLike)) {
        clearToken()
        setUser({ userName: '', email: '', avatar: '', role: null, permissions: [] } as AppUser)
        setSessionSignedIn(false)
        return {
          status: 'failed',
          message: 'Acceso denegado: tu rol no tiene permiso para ingresar.',
        }
      }

      handleSignIn({ accessToken: headerToken, refreshToken: rawRefreshToken }, (userLike ?? undefined) as AppUser)
      void hydrateUserFromApi()
      redirect()
      return { status: 'success', message: '' }
    } catch (e: unknown) {
      let msg = 'Error al iniciar sesión'
      if (isRecord(e) && isRecord(e.response) && isRecord(e.response.data)) {
        const m = (e.response.data as Record<string, unknown>).message
        if (typeof m === 'string' && m.trim()) msg = m
      }
      return { status: 'failed', message: msg }
    }
  }

  const signOut = async () => {
    try {
      await apiSignOut()
    } catch { }
    handleSignOut()
    const url = new URL(window.location.href)
    url.searchParams.delete(REDIRECT_URL_KEY)
    window.history.replaceState({}, '', url.pathname)
    navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath, { replace: true })

    setTimeout(() => {
      try {
        sessionStorage.removeItem('__isLoggingOut')
      } catch { }
    }, 100)
  }

  const oAuthSignIn = (callback: (payload: OauthSignInCallbackPayload) => void) => {
    callback({
      onSignIn: handleSignIn,
      redirect,
    })
  }

  useEffect(() => {
    if (token && !signedIn) setSessionSignedIn(true)
  }, [token, signedIn, setSessionSignedIn])

  useEffect(() => {
    const hasMinimalUser = isRecord(user) && typeof user.email === 'string' && user.email.length > 0
    if (token && !hasMinimalUser) void hydrateUserFromApi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (authenticated && isRecord(user)) {
      void prefetchCompaniesOnce()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user])

  return (
    <AuthContext.Provider value={{ authenticated, user, signIn, signOut, oAuthSignIn }}>
      {children}
      <IsolatedNavigator ref={navigatorRef} />
    </AuthContext.Provider>
  )
}

export default AuthProvider
