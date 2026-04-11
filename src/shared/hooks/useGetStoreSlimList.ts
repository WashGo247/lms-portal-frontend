import { useCallback, useState } from 'react';

import type { ApiState } from '@core/axiosClient';
import { storeScopeService } from '@shared/services/storeScopeService';
import type { StoreSlimItem } from '@shared/services/storeScopeService';

interface FetchParams {
  search?:   string;
  tenantId?: string;
}

export const useGetStoreSlimList = () => {
  const [state, setState] = useState<ApiState<StoreSlimItem[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (params?: FetchParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await storeScopeService.listSlim(params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, []);

  return { ...state, fetch };
};
