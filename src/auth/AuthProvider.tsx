// src/auth/AuthProvider.tsx
import { useRef, useImperativeHandle, useEffect, useRef as useRef2, forwardRef } from 'react'
import { useSWRConfig } from 'swr'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiSignIn } from '@/services/AuthService'
import { apiGetMe, normalizeUser } from '@/services/UserService'
import { apiGetMyCommunities, apiListCommunities } from '@/services/CommunitiesService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import { RBAC } from '@/utils/rbac'
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
function normalizeRoleToken(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z]/g, '')
}
function readRoleTokens(user: unknown): string[] {
  if (!isRecord(user)) return []
  const candidates: unknown[] = []
  const keys = ['roles', 'role', 'authorities', 'authority', 'permissions', 'scopes'] as const
  for (const k of keys) {
    if (k in user) candidates.push((user as Record<string, unknown>)[k])
  }
  const out: string[] = []
  for (const c of candidates) {
    if (typeof c === 'string') {
      out.push(c)
      continue
    }
    if (Array.isArray(c)) {
      for (const item of c) {
        if (typeof item === 'string') out.push(item)
        else if (isRecord(item)) {
          const maybe =
            toStr(item.name) ||
            toStr(item.role) ||
            toStr(item.key) ||
            toStr(item.code) ||
            toStr(item.authority) ||
            toStr(item.value) ||
            ''
          if (maybe) out.push(maybe)
        }
      }
      continue
    }
    if (isRecord(c)) {
      const maybe =
        toStr(c.name) ||
        toStr(c.role) ||
        toStr(c.key) ||
        toStr(c.code) ||
        toStr(c.authority) ||
        toStr(c.value) ||
        ''
      if (maybe) out.push(maybe)
    }
  }
  return out
}
function hasDashboardAccess(user: unknown): boolean {
  const tokens = readRoleTokens(user).map(normalizeRoleToken)
  if (!tokens.length) return false
  const allow = ['superadmin', 'admin', 'subadmin']
  return tokens.some((t) => allow.some((a) => t.includes(a)))
}
function isSuperAdminUser(user: unknown): boolean {
  const tokens = readRoleTokens(user).map(normalizeRoleToken)
  return tokens.some((t) => t.includes('superadmin') || t.includes('owner') || t.includes('root'))
}
function ensureBearerPrefix(token: string, tokenType?: string): string {
  const type = tokenType && tokenType.trim() ? tokenType : 'Bearer'
  const finalType = /^bearer$/i.test(type) ? 'Bearer' : type
  if (/^bearer\s+/i.test(token)) return token
  return `${finalType} ${token}`.trim()
}

function AuthProvider({ children }: AuthProviderProps) {
  const signedIn = useSessionUser((s) => s.session.signedIn)
  const user = useSessionUser((s) => s.user)
  const setUser = useSessionUser((s) => s.setUser)
  const setSessionSignedIn = useSessionUser((s) => s.setSessionSignedIn)
  const { token, setToken } = useToken()
  const authenticated = Boolean(token)

  const { setCommunities, reset: resetCommunities } = useCommunitiesStore()
  const { mutate, cache } = useSWRConfig()

  const navigatorRef = useRef<IsolatedNavigatorRef>(null)
  const hydratingRef = useRef2(false)
  const prefetchedRef = useRef2(false)

  const resetPerUserState = async () => {
    try { resetCommunities() } catch { }
    try { (cache as unknown as { clear?: () => void })?.clear?.() } catch { }
    await mutate(
      (key) =>
        Array.isArray(key) &&
        (key[0] === 'communities:list' || key[0] === 'news:list' || key[0] === 'news:detail'),
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

  const prefetchCommunitiesOnce = async (uLike: unknown) => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    try {
      const superAdmin = isSuperAdminUser(uLike)
      let list = []

      if (superAdmin) {
        // SUPERADMIN siempre carga TODAS las comunidades del sistema
        try {
          list = await apiListCommunities({ pageIndex: 1, pageSize: 10000 })
        } catch {
          // Fallback: intentar con mis comunidades
          list = await apiGetMyCommunities()
        }
      } else {
        // ADMIN/SUBADMIN solo ven sus comunidades asignadas
        list = await apiGetMyCommunities()
      }

      setCommunities(list, superAdmin ? 'all' : 'mine', { autoSelectIfSingle: true })
    } catch { }
  }

  const handleSignIn = (tokens: Token, u?: AppUser) => {
    setToken(tokens.accessToken)
    setSessionSignedIn(true)
    if (u) {
      // Normalizar usuario con datos del backend
      const normalized = normalizeUser(u as any)

      // Convertir a usuario RBAC con roles y permisos
      const rbacUser = RBAC.createAuthUser(normalized)

      setUser(rbacUser as AppUser)
      void prefetchCommunitiesOnce(rbacUser)
    } else {
      const emptyUser = { userName: '', email: '', avatar: '' } as unknown as AppUser
      setUser(emptyUser)
    }
  }

  const handleSignOut = () => {
    setToken('')
    const emptyUser = { userName: '', email: '', avatar: '' } as unknown as AppUser
    setUser(emptyUser)
    setSessionSignedIn(false)
    prefetchedRef.current = false
    void resetPerUserState()
  }

  const hydrateUserFromApi = async () => {
    if (hydratingRef.current) return
    hydratingRef.current = true
    try {
      const me = await apiGetMe()
      const normalized = normalizeUser(me)

      // Convertir a usuario RBAC con roles y permisos
      const rbacUser = RBAC.createAuthUser(normalized)

      setUser(rbacUser as unknown as AppUser)
      void prefetchCommunitiesOnce(rbacUser)
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
      const headerToken = ensureBearerPrefix(rawToken, tokenType)
      let userLike: unknown =
        (resp as Record<string, unknown>)?.user ??
        (resp as Record<string, unknown>)?.data
      if (!userLike) {
        setToken(headerToken)
        try {
          userLike = await apiGetMe()
        } catch { }
      }
      if (!hasDashboardAccess(userLike)) {
        setToken('')
        const emptyUser = { userName: '', email: '', avatar: '' } as unknown as AppUser
        setUser(emptyUser)
        setSessionSignedIn(false)
        return {
          status: 'failed',
          message: 'Acceso denegado: tu rol no tiene permiso para ingresar.',
        }
      }
      handleSignIn({ accessToken: headerToken }, (userLike ?? undefined) as AppUser)
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
    handleSignOut()
    navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath, { replace: true })
  }

  const oAuthSignIn = (callback: (payload: OauthSignInCallbackPayload) => void) => {
    callback({ onSignIn: handleSignIn, redirect })
  }

  useEffect(() => {
    if (token && !signedIn) setSessionSignedIn(true)
  }, [token, signedIn, setSessionSignedIn])

  useEffect(() => {
    const hasMinimalUser = isRecord(user) && typeof user.email === 'string' && user.email.length > 0
    if (token && !hasMinimalUser) hydrateUserFromApi()
  }, [token])

  useEffect(() => {
    if (authenticated && isRecord(user)) {
      void prefetchCommunitiesOnce(user)
    }
  }, [authenticated, user])

  return (
    <AuthContext.Provider value={{ authenticated, user, signIn, signOut, oAuthSignIn }}>
      {children}
      <IsolatedNavigator ref={navigatorRef} />
    </AuthContext.Provider>
  )
}

export default AuthProvider
