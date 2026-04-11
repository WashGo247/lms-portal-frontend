import axiosClient from '@core/axiosClient';

export interface StoreSlimItem {
  id:         string;
  name:       string;
  tenantId:   string;
  tenantName: string;
}

interface RawStore {
  id:          string;
  name:        string;
  tenant_id:   string;
  tenant_name: string;
}

interface ListStoresResponse {
  data: RawStore[];
}

interface ListSlimParams {
  search?:   string;
  tenantId?: string;
}

export const storeScopeService = {
  async listSlim(params?: ListSlimParams): Promise<StoreSlimItem[]> {
    const response = await axiosClient.get<ListStoresResponse>('/api/v1/store', {
      params: {
        page: 1,
        page_size: 1000,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.tenantId ? { tenant_id: params.tenantId } : {}),
      },
    });
    return response.data.data.map(s => ({
      id:         s.id,
      name:       s.name,
      tenantId:   s.tenant_id,
      tenantName: s.tenant_name,
    }));
  },
};
