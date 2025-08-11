import axios from 'axios'
import AxiosResponseIntrceptorErrorCallback from './AxiosResponseIntrceptorErrorCallback'
import AxiosRequestIntrceptorConfigCallback from './AxiosRequestIntrceptorConfigCallback'
import appConfig from '@/configs/app.config'
import type { AxiosError } from 'axios'

const AxiosBase = axios.create({
  baseURL: appConfig.apiPrefix,
  timeout: 60000,

})

AxiosBase.interceptors.request.use(
  (config) => AxiosRequestIntrceptorConfigCallback(config),
  (error) => Promise.reject(error),
)

AxiosBase.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    AxiosResponseIntrceptorErrorCallback(error)
    return Promise.reject(error)
  },
)

export default AxiosBase
