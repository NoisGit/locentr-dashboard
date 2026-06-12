const AUTH_BASE = '/api/v1/auth'

const endpointConfig = {
  signIn: `${AUTH_BASE}/login`,
  signOut: `${AUTH_BASE}/logout`,
  me: `${AUTH_BASE}/me`,
  refresh: `${AUTH_BASE}/refresh`,
  forgotPassword: `${AUTH_BASE}/forgot-password`,
  resetPassword: `${AUTH_BASE}/reset-password`,
}

export default endpointConfig
