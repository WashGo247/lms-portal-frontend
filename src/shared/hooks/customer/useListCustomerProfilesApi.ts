import { useCallback, useState } from 'react';

import axiosClient from '@core/axiosClient';
import { getBackendUrl } from '@shared/utils/env';
import { type ApiState } from '@shared/hooks/types';
import type { ListCustomerProfilesParams, ListCustomerProfilesResponse } from '@shared/types/customerProfile';

export const useListCustomerProfilesApi = <T = ListCustomerProfilesResponse>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const listCustomerProfiles = useCallback(async (params: ListCustomerProfilesParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await axiosClient.get<T>(
        `${getBackendUrl()}/portal_api/v1/customers`.replace(getBackendUrl(), ''),
        { params },
      );
      setState({ data: response.data as T, loading: false, error: null });
      return response.data as T;
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) });
      throw error;
    }
  }, []);

  return { ...state, listCustomerProfiles };
};
