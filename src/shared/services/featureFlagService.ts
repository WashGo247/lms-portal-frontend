import axiosClient from '@core/axiosClient';

import type {
  CreateFeatureFlagParams,
  FeatureFlag,
  UpdateFeatureFlagParams,
} from '@shared/types/featureFlag';

interface RawFlag {
  key: string;
  display_name: string;
  description: string;
  is_enabled: boolean;
  scope_type: string;
  scope_ids: string[];
  created_at: string;
  updated_at: string;
}

function mapFlag(raw: RawFlag): FeatureFlag {
  return {
    key: raw.key,
    displayName: raw.display_name,
    description: raw.description,
    isEnabled: raw.is_enabled,
    scopeType: raw.scope_type as FeatureFlag['scopeType'],
    scopeIds: raw.scope_ids,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export const featureFlagService = {
  async list(): Promise<FeatureFlag[]> {
    const response = await axiosClient.get<{ flags: RawFlag[] }>(
      '/api/v2/admin/feature-flags',
    );
    return response.data.flags.map(mapFlag);
  },

  async create(params: CreateFeatureFlagParams): Promise<FeatureFlag> {
    const response = await axiosClient.post<{ flag: RawFlag }>(
      '/api/v2/admin/feature-flags',
      {
        key: params.key,
        display_name: params.displayName,
        description: params.description,
        is_enabled: params.isEnabled,
        scope_type: params.scopeType,
        scope_ids: params.scopeIds,
      },
    );
    return mapFlag(response.data.flag);
  },

  async update(key: string, params: UpdateFeatureFlagParams): Promise<FeatureFlag> {
    const body: Record<string, unknown> = {};
    if (params.displayName !== undefined) body.display_name = params.displayName;
    if (params.description !== undefined) body.description = params.description;
    if (params.isEnabled !== undefined) body.is_enabled = params.isEnabled;
    if (params.scopeType !== undefined) body.scope_type = params.scopeType;
    if (params.scopeIds !== undefined) body.scope_ids = params.scopeIds;

    const response = await axiosClient.patch<{ flag: RawFlag }>(
      `/api/v2/admin/feature-flags/${key}`,
      body,
    );
    return mapFlag(response.data.flag);
  },

  async delete(key: string): Promise<void> {
    await axiosClient.delete(`/api/v2/admin/feature-flags/${key}`);
  },
};
