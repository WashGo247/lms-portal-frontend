import axios from 'axios'
import { getBackendUrl } from '@shared/utils/env'
import { tokenManager } from './auth/tokenManager'

const axiosClient = axios.create({
  baseURL: `${getBackendUrl()}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(async (config) => {
  const token = await tokenManager.ensureValidAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      const originalRequest = error.config as any
      if (!originalRequest?._retry) {
        originalRequest._retry = true
        try {
          const newAccessToken = await tokenManager.ensureValidAccessToken()
          if (newAccessToken) {
            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return axiosClient.request(originalRequest)
          }
        } catch {}
      }
      tokenManager.clear()
      try {
        window.location.href = '/auth/sign-in'
      } catch {}
    }
    return Promise.reject(error)
  }
)

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export default axiosClient
