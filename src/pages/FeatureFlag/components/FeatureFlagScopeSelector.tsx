import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, Radio, Select } from 'antd';

import { useGetTenantSlimList } from '@shared/hooks/useGetTenantSlimList';
import { useGetStoreSlimList } from '@shared/hooks/useGetStoreSlimList';
import type { FeatureFlagScopeType } from '@shared/types/featureFlag';

interface ScopeValue {
  scopeType: FeatureFlagScopeType;
  scopeIds:  string[];
}

interface Props {
  value:    ScopeValue;
  onChange: (value: ScopeValue) => void;
  style?: React.CSSProperties;
}

const DEBOUNCE_MS = 300;

export const FeatureFlagScopeSelector: React.FC<Props> = ({ value, onChange, style }) => {
  const { t } = useTranslation();

  const tenants = useGetTenantSlimList();
  const stores  = useGetStoreSlimList();

  const [tenantFilter, setTenantFilter] = useState<string | undefined>(undefined);

  const tenantSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storeSearchTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data when scope type becomes active
  useEffect(() => {
    if (value.scopeType === 'tenants') {
      tenants.fetch();
    } else if (value.scopeType === 'stores') {
      tenants.fetch();
      stores.fetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.scopeType]);

  const handleScopeTypeChange = (scopeType: FeatureFlagScopeType) => {
    setTenantFilter(undefined);
    onChange({ scopeType, scopeIds: [] });
  };

  const handleTenantSearch = useCallback((search: string) => {
    if (tenantSearchTimer.current) clearTimeout(tenantSearchTimer.current);
    tenantSearchTimer.current = setTimeout(() => tenants.fetch(search), DEBOUNCE_MS);
  }, [tenants]);

  const handleTenantFilterChange = (tenantId: string | undefined) => {
    setTenantFilter(tenantId);
    onChange({ ...value, scopeIds: [] });
    stores.fetch({ tenantId });
  };

  const handleStoreSearch = useCallback((search: string) => {
    if (storeSearchTimer.current) clearTimeout(storeSearchTimer.current);
    storeSearchTimer.current = setTimeout(
      () => stores.fetch({ search, tenantId: tenantFilter }),
      DEBOUNCE_MS,
    );
  }, [stores, tenantFilter]);

  const tenantOptions = (tenants.data ?? []).map((t: any) => ({ label: t.name, value: t.id }));

  const storeOptions = (stores.data ?? []).map((s: any) => ({
    label: `${s.name} (${s.tenantName})`,
    value: s.id,
  }));

  return (
    <Flex vertical gap={8} style={style}>
      <Radio.Group
        value={value.scopeType}
        onChange={e => handleScopeTypeChange(e.target.value)}
      >
        <Radio value="all">{t('featureFlag.scope.all')}</Radio>
        <Radio value="tenants">{t('featureFlag.scope.tenants')}</Radio>
        <Radio value="stores">{t('featureFlag.scope.stores')}</Radio>
      </Radio.Group>

      {value.scopeType === 'tenants' && (
        <Select
          size="large"
          mode="multiple"
          showSearch
          value={value.scopeIds}
          options={tenantOptions}
          loading={tenants.loading}
          placeholder={t('featureFlag.selectTenants')}
          filterOption={(input, option) =>
            (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
          }
          onSearch={handleTenantSearch}
          onChange={scopeIds => onChange({ ...value, scopeIds })}
          style={{ width: '100%' }}
          allowClear
        />
      )}

      {value.scopeType === 'stores' && (
        <Flex vertical gap={8}>
          <Select
            showSearch
            allowClear
            size="large"
            value={tenantFilter}
            options={tenantOptions}
            loading={tenants.loading}
            placeholder={t('featureFlag.filterByTenant')}
            filterOption={(input, option) =>
              (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleTenantFilterChange}
            style={{ width: '100%' }}
          />
          <Select
            mode="multiple"
            showSearch
            value={value.scopeIds}
            options={storeOptions}
            loading={stores.loading}
            placeholder={t('featureFlag.selectStores')}
            filterOption={(input, option) =>
              (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onSearch={handleStoreSearch}
            onChange={scopeIds => onChange({ ...value, scopeIds })}
            size="large"
            style={{ width: '100%' }}
            allowClear
          />
        </Flex>
      )}
    </Flex>
  );
};
