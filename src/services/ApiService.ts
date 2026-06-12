import AxiosBase from './axios/AxiosBase'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

const ApiService = {
    fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
        config: AxiosRequestConfig<Request>,
    ) {
        return new Promise<Response>((resolve, reject) => {
            AxiosBase(config)
                .then((response: AxiosResponse<Response>) => {
                    resolve(response.data)
                })
                .catch((error: AxiosError) => {
                    reject(error)
                })
        })
    },
}

export default ApiService
