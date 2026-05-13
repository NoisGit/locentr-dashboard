// src/configs/endpoint.config.ts
import appConfig from '@/configs/app.config'

const API_BASE = `${appConfig.apiPrefix}/api/v1`
const AUTH_BASE = `${API_BASE}/auth`

const endpointConfig = {
  signIn: `${AUTH_BASE}/login`,
  signOut: `${AUTH_BASE}/logout`,
  me: `${AUTH_BASE}/me`,
  refresh: `${AUTH_BASE}/refresh`,
  refreshAccessToken: `${AUTH_BASE}/refresh-access-token`,
  forgotPassword: `${AUTH_BASE}/forgot-password`,
  resetPassword: `${AUTH_BASE}/reset-password`,
}

export default endpointConfig
