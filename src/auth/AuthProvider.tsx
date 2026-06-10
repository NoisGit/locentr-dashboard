import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useSWRConfig } from 'swr'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { apiMe, apiSignIn, apiSignOut } from '@/services/AuthService'
import { normalizeUser } from '@/services/UsersService'
import {
    apiListCompanies,
    filterCompaniesForUser,
} from '@/services/CompaniesService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import { RBAC, Role } from '@/utils/rbac'
import { captureEvent } from '@/services/TelemetryService'
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

const emptyUser = {
    userName: '',
    email: '',
    avatar: '',
    role: null,
    permissions: [],
} as AppUser

const resetCachePrefixes = [
    'companies:',
    'locations:',
    'users:',
    'documents:',
    'notifications:',
    'support-tickets:',
    'audit-log:',
    'dashboard:',
    'location-logbook:',
]

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>(
    function IsolatedNavigator(_, ref) {
        const navigate = useNavigate()
        useImperativeHandle(ref, () => ({ navigate }), [navigate])
        return null
    },
)

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

function getSafeRedirectPath(rawRedirect: string | null): string {
    if (!rawRedirect) return appConfig.authenticatedEntryPath

    const value = rawRedirect.trim()
    if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
        return appConfig.authenticatedEntryPath
    }

    try {
        const url = new URL(value, window.location.origin)
        if (url.origin !== window.location.origin) {
            return appConfig.authenticatedEntryPath
        }

        const path = `${url.pathname}${url.search}${url.hash}`
        if (path.startsWith('/auth')) {
            return appConfig.authenticatedEntryPath
        }

        return path
    } catch {
        return appConfig.authenticatedEntryPath
    }
}

function getHumanAuthError(error: unknown): string {
    if (isRecord(error) && isRecord(error.response)) {
        const status = Number(error.response.status)
        if (status === 401 || status === 403) {
            return 'Credenciales inválidas. Revisa tus datos e intenta nuevamente.'
        }
        if (status === 422) {
            return 'Revisa los campos del formulario.'
        }
        if (status === 429) {
            return 'Demasiados intentos. Intenta nuevamente más tarde.'
        }
        if (status >= 500) {
            return 'Ocurrió un error inesperado. Intenta nuevamente más tarde.'
        }
    }

    return 'No se pudo iniciar sesión. Intenta nuevamente.'
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
    const hasValidUser = hasAppAccess(user)
    const authenticated = Boolean(token) && hasValidUser
    const [isAuthLoading, setIsAuthLoading] = useState(
        Boolean(token) && !hasValidUser,
    )

    const { setCompanies, reset: resetCompanies } = useCompaniesStore()
    const { mutate, cache } = useSWRConfig()

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)
    const hydratingRef = useRef(false)
    const prefetchedRef = useRef(false)

    const resetPerUserState = async () => {
        try {
            resetCompanies()
        } catch {}
        try {
            ;(cache as unknown as { clear?: () => void })?.clear?.()
        } catch {}
        await mutate(
            (key) =>
                Array.isArray(key) &&
                typeof key[0] === 'string' &&
                resetCachePrefixes.some((prefix) => key[0].startsWith(prefix)),
            undefined,
            { revalidate: false },
        )
    }

    const redirect = () => {
        const params = new URLSearchParams(window.location.search)
        const redirectUrl = getSafeRedirectPath(params.get(REDIRECT_URL_KEY))
        navigatorRef.current?.navigate(redirectUrl, { replace: true })
    }

    const prefetchCompaniesOnce = async () => {
        if (prefetchedRef.current) return
        prefetchedRef.current = true
        try {
            const list = await apiListCompanies({ pageIndex: 1, pageSize: 200 })
            const currentUser = useSessionUser.getState().user
            const visibleList = filterCompaniesForUser(
                list,
                currentUser.role,
                currentUser.company_id,
            )
            setCompanies(visibleList, 'all', { autoSelectIfSingle: true })
        } catch {}
    }

    const applyUser = (userData: unknown) => {
        const normalized = normalizeUser(userData)
        const rbacUser = RBAC.createAuthUser(normalized)

        if (rbacUser) {
            setUser({ ...normalized, ...rbacUser } as AppUser)
        } else {
            setUser(normalized as AppUser)
        }
    }

    const handleSignIn = (tokens: Token, u?: AppUser) => {
        setToken(tokens.accessToken)
        if (tokens.refreshToken) {
            setRefreshToken(tokens.refreshToken)
        }
        setSessionSignedIn(true)

        if (u) {
            applyUser(u)
            void prefetchCompaniesOnce()
            return
        }

        setUser(emptyUser)
    }

    const handleSignOut = () => {
        try {
            sessionStorage.setItem('__isLoggingOut', 'true')
        } catch {}

        clearToken()
        setUser(emptyUser)
        setSessionSignedIn(false)
        prefetchedRef.current = false
        void resetPerUserState()
    }

    const hydrateUserFromApi = async () => {
        if (hydratingRef.current) return
        hydratingRef.current = true
        setIsAuthLoading(true)
        try {
            const me = await apiMe<unknown>()

            if (!hasAppAccess(me)) {
                throw new Error('Authenticated user does not have a supported role.')
            }

            applyUser(me)
            void prefetchCompaniesOnce()
        } catch {
            clearToken()
            setUser(emptyUser)
            setSessionSignedIn(false)
            prefetchedRef.current = false
            void resetPerUserState()
        } finally {
            hydratingRef.current = false
            setIsAuthLoading(false)
        }
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const resp = await apiSignIn(values)
            const rawToken =
                toStr((resp as Record<string, unknown>)?.access_token) ||
                toStr((resp as Record<string, unknown>)?.accessToken) ||
                toStr((resp as Record<string, unknown>)?.token)

            if (!rawToken) {
                return { status: 'failed', message: 'No fue posible iniciar sesión.' }
            }

            const tokenType =
                toStr((resp as Record<string, unknown>)?.token_type) ||
                toStr((resp as Record<string, unknown>)?.tokenType)
            const rawRefreshToken =
                toStr((resp as Record<string, unknown>)?.refresh_token) ||
                toStr((resp as Record<string, unknown>)?.refreshToken)
            const headerToken = ensureBearerPrefix(rawToken, tokenType)

            setToken(headerToken)
            if (rawRefreshToken) {
                setRefreshToken(rawRefreshToken)
            }

            const userLike =
                (resp as Record<string, unknown>)?.user ??
                (await apiMe<unknown>())

            if (!hasAppAccess(userLike)) {
                clearToken()
                setUser(emptyUser)
                setSessionSignedIn(false)
                return {
                    status: 'failed',
                    message: 'Acceso denegado: tu rol no tiene permiso para ingresar.',
                }
            }

            handleSignIn(
                { accessToken: headerToken, refreshToken: rawRefreshToken },
                userLike as AppUser,
            )
            captureEvent('auth.sign_in_succeeded', {
                role: RBAC.extractUserRole(userLike) ?? 'UNKNOWN',
            })
            redirect()
            return { status: 'success', message: '' }
        } catch (error: unknown) {
            captureEvent('auth.sign_in_failed', undefined, 'warning')
            clearToken()
            setUser(emptyUser)
            setSessionSignedIn(false)
            return { status: 'failed', message: getHumanAuthError(error) }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } catch {}
        handleSignOut()
        captureEvent('auth.sign_out')
        const url = new URL(window.location.href)
        url.searchParams.delete(REDIRECT_URL_KEY)
        window.history.replaceState({}, '', url.pathname)
        navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath, { replace: true })

        setTimeout(() => {
            try {
                sessionStorage.removeItem('__isLoggingOut')
            } catch {}
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
        if (token && !hasAppAccess(user)) {
            void hydrateUserFromApi()
        } else {
            setIsAuthLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    useEffect(() => {
        if (authenticated && isRecord(user)) {
            void prefetchCompaniesOnce()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authenticated, user])

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                isAuthLoading,
                user,
                signIn,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
