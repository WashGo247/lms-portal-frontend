import axiosClient from '@core/axiosClient'
import { useCallback, useState } from 'react'

import { getBackendUrl } from '@shared/utils/env'
import { type ApiState } from '@shared/hooks/types'

import { type Store } from '@shared/types/store';

export type CreateStoreRequest = {
  name: string;
  contact_phone_number: string;
  address: string;
  tenant_id: string;
  logo_url?: string | null;
}

export type CreateStoreResponse = Store;

export async function createStoreApi(request: CreateStoreRequest): Promise<CreateStoreResponse> {
  const url = `${getBackendUrl()}/api/v1/store`
  const payload = {
    name: request.name,
    contact_phone_number: request.contact_phone_number,
    address: request.address,
    tenant_id: request.tenant_id,
    logo_url: request.logo_url ?? null,
  }

  const res = await axiosClient.post<CreateStoreResponse>(url.replace(getBackendUrl(), ''), payload)
  return res.data as CreateStoreResponse
}

export const useCreateStoreApi = <T = CreateStoreResponse>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const createStore = useCallback(async (payload: CreateStoreRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await createStoreApi(payload)
      setState({ data: data as T, loading: false, error: null })
      return data as T
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) })
      throw error
    }
  }, [])

  return { ...state, createStore }
}
