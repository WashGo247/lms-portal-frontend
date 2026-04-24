import { useCallback, useState } from 'react';

import axiosClient from '@core/axiosClient';
import { getBackendUrl } from '@shared/utils/env';
import { type ApiState } from '@shared/hooks/types';
import type { CustomerProfile, UpdateCustomerProfileRequest } from '@shared/types/customerProfile';

export const useUpdateCustomerProfileApi = <T = CustomerProfile>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateCustomerProfile = useCallback(async (profileId: string, payload: UpdateCustomerProfileRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await axiosClient.patch<T>(
        `${getBackendUrl()}/portal_api/v1/customers/${profileId}`.replace(getBackendUrl(), ''),
        payload,
      );
      setState({ data: response.data as T, loading: false, error: null });
      return response.data as T;
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) });
      throw error;
    }
  }, []);

  return { ...state, updateCustomerProfile };
};
