export type FeatureFlagScopeType = 'all' | 'tenants' | 'stores';

export interface FeatureFlag {
  key: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  scopeType: FeatureFlagScopeType;
  scopeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureFlagParams {
  key: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  scopeType: FeatureFlagScopeType;
  scopeIds: string[];
}

export interface UpdateFeatureFlagParams {
  displayName?: string;
  description?: string;
  isEnabled?: boolean;
  scopeType?: FeatureFlagScopeType;
  scopeIds?: string[];
}
