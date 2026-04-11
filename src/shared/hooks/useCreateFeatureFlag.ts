import { useCallback, useState } from 'react';

import { featureFlagService } from '@shared/services/featureFlagService';
import type { CreateFeatureFlagParams, FeatureFlag } from '@shared/types/featureFlag';

import type { ApiState } from '@core/axiosClient';

export const useCreateFeatureFlag = () => {
  const [state, setState] = useState<ApiState<FeatureFlag>>({
    data: null,
    loading: false,
    error: null,
  });

  const create = useCallback(async (params: CreateFeatureFlagParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await featureFlagService.create(params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }));
      throw error;
    }
  }, []);

  return { ...state, create };
};
