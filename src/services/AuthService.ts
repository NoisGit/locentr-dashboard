// src/services/AuthService.ts
import ApiService from '@/services/ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
  SignInCredential,
  ForgotPassword,
  ResetPassword,
  SignInResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential): Promise<SignInResponse> {
  return ApiService.fetchDataWithAxios<SignInResponse>({
    url: endpointConfig.signIn,
    method: 'post',
    data,
  })
}

// No-Op (si el backend no expone logout)
export async function apiSignOut(): Promise<void> {
  return
}

export async function apiMe<T = unknown>(): Promise<T> {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.me,
    method: 'get',
  })
}

export async function apiForgotPassword<T>(data: ForgotPassword): Promise<T> {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.forgotPassword,
    method: 'post',
    data,
  })
}

export async function apiResetPassword<T>(data: ResetPassword): Promise<T> {
  return ApiService.fetchDataWithAxios<T>({
    url: endpointConfig.resetPassword,
    method: 'post',
    data,
  })
}
