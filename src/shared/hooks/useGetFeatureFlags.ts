import { useCallback, useState } from 'react';

import { featureFlagService } from '@shared/services/featureFlagService';
import type { FeatureFlag } from '@shared/types/featureFlag';

import type { ApiState } from '@core/axiosClient';

export const useGetFeatureFlags = () => {
  const [state, setState] = useState<ApiState<FeatureFlag[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await featureFlagService.list();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, []);

  return { ...state, fetch };
};
