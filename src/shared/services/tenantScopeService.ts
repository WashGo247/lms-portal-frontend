import axiosClient from '@core/axiosClient';

export interface TenantSlimItem {
  id:   string;
  name: string;
}

interface RawTenant {
  id:   string;
  name: string;
}

interface ListTenantsResponse {
  data: RawTenant[];
}

export const tenantScopeService = {
  async listSlim(search?: string): Promise<TenantSlimItem[]> {
    const response = await axiosClient.get<ListTenantsResponse>('/api/v1/tenant', {
      params: {
        page: 1,
        page_size: 1000,
        ...(search ? { search } : {}),
      },
    });
    return response.data.data.map(t => ({ id: t.id, name: t.name }));
  },
};
