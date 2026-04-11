import { useCallback, useState } from 'react';

import { featureFlagService } from '@shared/services/featureFlagService';

export const useDeleteFeatureFlag = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      await featureFlagService.delete(key);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, remove };
};
