// src/auth/AuthProvider.tsx
import { useRef, useImperativeHandle, useState, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut } from '@/services/AuthService'
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
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
  navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
  const navigate = useNavigate()
  useImperativeHandle(ref, () => ({ navigate }), [navigate])
  return null
}

function AuthProvider({ children }: AuthProviderProps) {
  const signedIn = useSessionUser((state) => state.session.signedIn)
  const user = useSessionUser((state) => state.user)
  const setUser = useSessionUser((state) => state.setUser)
  const setSessionSignedIn = useSessionUser((state) => state.setSessionSignedIn)

  const { token, setToken } = useToken()
  const [tokenState, setTokenState] = useState(token)

  // ✅ Trata el token como “estoy autenticado”
  const authenticated = Boolean(tokenState)

  const navigatorRef = useRef<IsolatedNavigatorRef>(null)

  const redirect = () => {
    const params = new URLSearchParams(window.location.search)
    const redirectUrl = params.get(REDIRECT_URL_KEY)
    navigatorRef.current?.navigate(
      redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
    )
  }

  const handleSignIn = (tokens: Token, u?: AppUser) => {
    setToken(tokens.accessToken)
    setTokenState(tokens.accessToken)
    setSessionSignedIn(true)

    // ⚡ Normaliza inmediatamente lo que venga del login
    if (u) setUser(normalizeUser(u as any) as unknown as AppUser)
    else setUser({ userName: '', email: '', avatar: '' } as any)
  }

  const handleSignOut = () => {
    setToken('')
    setUser({ userName: '', email: '', avatar: '' } as any)
    setSessionSignedIn(false)
  }

  const hydrateUserFromApi = async () => {
    try {
      const me = await apiGetMe()
      const normalized = normalizeUser(me)
      setUser(normalized as unknown as AppUser)
    } catch {
      // no rompas la UI si /me falla
    }
  }

  const signIn = async (values: SignInCredential): AuthResult => {
    try {
      const resp = await apiSignIn(values)
      if (resp?.token) {
        handleSignIn({ accessToken: resp.token }, resp.user)
        // Trae /me para asegurar nombre/email/rol actualizados
        await hydrateUserFromApi()
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
    try {
      await apiSignOut()
    } finally {
      handleSignOut()
      navigatorRef.current?.navigate('/')
    }
  }

  const oAuthSignIn = (
    callback: (payload: OauthSignInCallbackPayload) => void,
  ) => {
    callback({ onSignIn: handleSignIn, redirect })
  }

  // 🔸 Si hay token pero `signedIn` es falso (refresh), márcalo
  useEffect(() => {
    if (tokenState && !signedIn) setSessionSignedIn(true)
  }, [tokenState, signedIn, setSessionSignedIn])

  // 🔸 Con token presente y sin email en el store → hidratar desde /me
  useEffect(() => {
    const hasMinimalUser = Boolean((user as any)?.email)
    if (tokenState && !hasMinimalUser) {
      hydrateUserFromApi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenState])

  return (
    <AuthContext.Provider
      value={{
        authenticated,
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
