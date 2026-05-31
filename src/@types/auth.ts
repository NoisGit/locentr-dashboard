export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    access_token: string
    refresh_token: string
    token_type?: string
    user?: User
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    reset_token: string
    new_password: string
    confirm_new_password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    userId?: string | null
    id?: string | number | null
    avatar?: string | null
    userName?: string | null
    full_name?: string | null
    email?: string | null
    role?: string | null
    role_id?: string | number | null
    authority?: string[]
}

export type Token = {
    accessToken: string
    refreshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
