import { useCallback, useState } from 'react'

import { getBackendUrl } from '@shared/utils/env'
import { type ApiState } from '@shared/hooks/types'
import axiosClient from '@core/axiosClient'

export const useApproveAuthSessionApi = () => {
  const [state, setState] = useState<ApiState<void>>({
    data: null,
    loading: false,
    error: null,
  });

  const approveAuthSession = useCallback(async (sessionId: string) => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    try {
      await axiosClient.post(
        `${getBackendUrl()}/api/v1/auth/sso/session/${sessionId}/approve`.replace(getBackendUrl(), ''),
      );
      setState({ data: undefined, loading: false, error: null });
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) });
      throw error;
    }
  }, [setState]);

  return { ...state, approveAuthSession };
};
