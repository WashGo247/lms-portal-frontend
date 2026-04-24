import { useCallback, useState } from 'react';

import axiosClient from '@core/axiosClient';
import { getBackendUrl } from '@shared/utils/env';
import { type ApiState } from '@shared/hooks/types';

export const useResetCustomerPasswordApi = () => {
  const [state, setState] = useState<ApiState<void>>({
    data: null,
    loading: false,
    error: null,
  });

  const resetCustomerPassword = useCallback(async (profileId: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await axiosClient.patch(
        `${getBackendUrl()}/portal_api/v1/customers/${profileId}/reset-password`.replace(getBackendUrl(), ''),
        { password },
      );
      setState({ data: undefined, loading: false, error: null });
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) });
      throw error;
    }
  }, []);

  return { ...state, resetCustomerPassword };
};
