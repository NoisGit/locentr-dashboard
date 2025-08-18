// src/services/authService.ts
import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
  SignInCredential,
  ForgotPassword,
  ResetPassword,
  SignInResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
  return ApiService.fetchDataWithAxios<SignInResponse>({
    url: endpointConfig.signIn,
    method: 'post',
    data,
  })
}

// No-Op: no hacemos request al backend
export async function apiSignOut(): Promise<void> {
  return
}

export async function apiMe<T = any>() {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.me,
    method: 'get',
  })
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.forgotPassword,
    method: 'post',
    data,
  })
}

export async function apiResetPassword<T>(data: ResetPassword) {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.resetPassword,
    method: 'post',
    data,
  })
}
