import axiosClient from '@core/axiosClient'
import { useCallback, useState } from 'react'

import { getBackendUrl } from '@shared/utils/env'
import { type ApiState } from '@shared/hooks/types'

import { type Store } from '@shared/types/store';
import { type PaymentMethod } from '@shared/types/PaymentMethod';

export type UpdateStoreRequest = {
  name: string;
  contact_phone_number: string;
  address: string;
  tenant_id: string;
  payment_methods: PaymentMethod[];
  logo_url?: string | null;
}

export type UpdateStoreResponse = Store;

export async function updateStoreApi(storeId: string, request: UpdateStoreRequest): Promise<UpdateStoreResponse> {
  const url = `${getBackendUrl()}/api/v1/store/${storeId}`
  const payload = {
    name: request.name,
    contact_phone_number: request.contact_phone_number,
    address: request.address,
    tenant_id: request.tenant_id,
    payment_methods: request.payment_methods,
    logo_url: request.logo_url ?? null,
  }

  const res = await axiosClient.patch<UpdateStoreResponse>(url.replace(getBackendUrl(), ''), payload)
  return res.data as UpdateStoreResponse
}

export const useUpdateStoreApi = <T = UpdateStoreResponse>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const updateStore = useCallback(async (storeId: string, payload: UpdateStoreRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await updateStoreApi(storeId, payload)
      setState({ data: data as T, loading: false, error: null })
      return data as T
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) })
      throw error
    }
  }, [])

  return { ...state, updateStore }
}
