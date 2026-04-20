import axiosClient from '@core/axiosClient'
import { useCallback, useState } from 'react'

import { getBackendUrl } from '@shared/utils/env'
import { type ApiState } from '@shared/hooks/types'

interface UploadStoreLogoRequest {
  file: File
}

export type UploadStoreLogoResponse = {
  url: string
}

export async function uploadStoreLogoApi(request: UploadStoreLogoRequest): Promise<UploadStoreLogoResponse> {
  const url = `${getBackendUrl()}/portal_api/v1/upload/logo`
  const formData = new FormData()
  formData.append('file', request.file)

  const response = await axiosClient.post<UploadStoreLogoResponse>(
    url.replace(getBackendUrl(), ''),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const useUploadStoreLogoApi = <T = UploadStoreLogoResponse>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const uploadStoreLogo = useCallback(async (request: UploadStoreLogoRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await uploadStoreLogoApi(request)
      setState({ data: response as T, loading: false, error: null })
      return response as T
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) })
      throw error
    }
  }, [])

  return { ...state, uploadStoreLogo }
}
