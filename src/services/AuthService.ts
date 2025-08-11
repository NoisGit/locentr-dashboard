// src/services/authService.ts
import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
  SignInCredential,
  ForgotPassword,
  ResetPassword,
  SignInResponse,
} from '@/@types/auth'

// POST /api/v1/users/login
export async function apiSignIn(data: SignInCredential) {
  return ApiService.fetchDataWithAxios<SignInResponse>({
    url: endpointConfig.signIn, // ya apunta a .../api/v1/users/login
    method: 'post',
    data,
  })
}

// POST /api/v1/users/logout
export async function apiSignOut() {
  return ApiService.fetchDataWithAxios({
    url: endpointConfig.signOut,
    method: 'post',
  })
}

// GET /api/v1/users/me   (si existe en tu API)
export async function apiMe<T = any>() {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.me,
    method: 'get',
  })
}

// POST /api/v1/users/forgot-password (si existe)
export async function apiForgotPassword<T>(data: ForgotPassword) {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.forgotPassword,
    method: 'post',
    data,
  })
}

// POST /api/v1/users/reset-password (si existe)
export async function apiResetPassword<T>(data: ResetPassword) {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.resetPassword,
    method: 'post',
    data,
  })
}
