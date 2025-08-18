import { useRef, useImperativeHandle, useEffect, useRef as useRef2, forwardRef } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn } from '@/services/AuthService'
import { apiGetMe, normalizeUser } from '@/services/UserService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
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

function AuthProvider({ children }: AuthProviderProps) {
  const signedIn = useSessionUser((s) => s.session.signedIn)
  const user = useSessionUser((s) => s.user)
  const setUser = useSessionUser((s) => s.setUser)
  const setSessionSignedIn = useSessionUser((s) => s.setSessionSignedIn)

  const { token, setToken } = useToken()
  const authenticated = Boolean(token)

  const navigatorRef = useRef<IsolatedNavigatorRef>(null)
  const hydratingRef = useRef2(false)

  const redirect = () => {
    const params = new URLSearchParams(window.location.search)
    const redirectUrl = params.get(REDIRECT_URL_KEY)
    navigatorRef.current?.navigate(
      redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
      { replace: true },
    )
  }

  const handleSignIn = (tokens: Token, u?: AppUser) => {
    setToken(tokens.accessToken)
    setSessionSignedIn(true)
    if (u) setUser(normalizeUser(u as any) as unknown as AppUser)
    else setUser({ userName: '', email: '', avatar: '' } as any)
  }

  const handleSignOut = () => {
    setToken('')
    setUser({ userName: '', email: '', avatar: '' } as any)
    setSessionSignedIn(false)
  }

  const hydrateUserFromApi = async () => {
    if (hydratingRef.current) return
    hydratingRef.current = true
    try {
      const me = await apiGetMe()
      const normalized = normalizeUser(me)
      setUser(normalized as unknown as AppUser)
    } finally {
      hydratingRef.current = false
    }
  }

  const signIn = async (values: SignInCredential): AuthResult => {
    try {
      const resp = await apiSignIn(values)
      if (resp?.token) {
        handleSignIn({ accessToken: resp.token }, resp.user)
        hydrateUserFromApi()
        redirect()
        return { status: 'success', message: '' }
      }
      return { status: 'failed', message: 'Unable to sign in' }
    } catch (errors: any) {
      return {
        status: 'failed',
        message: errors?.response?.data?.message || errors.toString(),
      }
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
    const hasMinimalUser = Boolean((user as any)?.email)
    if (token && !hasMinimalUser) hydrateUserFromApi()
  }, [token]) // eslint-disable-line

  return (
    <AuthContext.Provider value={{ authenticated, user, signIn, signOut, oAuthSignIn }}>
      {children}
      <IsolatedNavigator ref={navigatorRef} />
    </AuthContext.Provider>
  )
}

export default AuthProvider
