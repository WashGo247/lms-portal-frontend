import { useCallback, useState } from 'react';

import { featureFlagService } from '@shared/services/featureFlagService';
import type { FeatureFlag, UpdateFeatureFlagParams } from '@shared/types/featureFlag';

import type { ApiState } from '@core/axiosClient';

export const useUpdateFeatureFlag = () => {
  const [state, setState] = useState<ApiState<FeatureFlag>>({
    data: null,
    loading: false,
    error: null,
  });

  const update = useCallback(async (key: string, params: UpdateFeatureFlagParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await featureFlagService.update(key, params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }));
      throw error;
    }
  }, []);

  return { ...state, update };
};
