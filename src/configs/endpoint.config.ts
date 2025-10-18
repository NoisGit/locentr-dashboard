// src/configs/endpoint.config.ts
import appConfig from '@/configs/app.config'

const API_BASE = `${appConfig.apiPrefix}/api/v1`

const endpointConfig = {
  signIn: `${API_BASE}/users/login`,
  signOut: `${API_BASE}/users/logout`,
  me: `${API_BASE}/users/me`, 
  refresh: `${API_BASE}/users/refresh`,
  refreshAccessToken: `${API_BASE}/users/refresh-access-token`,
  forgotPassword: `${API_BASE}/users/forgot-password`,
  resetPassword: `${API_BASE}/users/reset-password`,
}

export default endpointConfig
