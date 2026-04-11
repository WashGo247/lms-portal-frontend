import { useCallback, useState } from 'react';

import type { ApiState } from '@core/axiosClient';
import { tenantScopeService } from '@shared/services/tenantScopeService';
import type { TenantSlimItem } from '@shared/services/tenantScopeService';

export const useGetTenantSlimList = () => {
  const [state, setState] = useState<ApiState<TenantSlimItem[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (search?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await tenantScopeService.listSlim(search);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, []);

  return { ...state, fetch };
};
