import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, Segmented } from 'antd';

import { useTheme } from '@shared/theme/useTheme';
import { useCan } from '@shared/hooks/useCan';

import type { Store } from '@shared/types/store';

import { ChipFilter, type QuickFilterOption } from '@shared/components/ChipFilterComponent';

import { StoreKeyMetrics } from './StoreKeyMetrics';
import { TopOrderOverview } from './TopOrderOverview';
import { MachineOverview } from './MachineOverview';
import { MachineStatusOverview } from './MachineStatusOverview';

interface Props {
  store: Store;
  quickFilterOptions: QuickFilterOption[];
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onFilterClick?: () => void;
  datetimeFilters?: {
    start_datetime: string;
    end_datetime: string;
  };
}

export const MobileView: React.FC<Props> = ({
  store,
  quickFilterOptions,
  filters,
  onFilterChange,
  onFilterClick,
  datetimeFilters,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const can = useCan();

  const tabOptions: { label: string; value: string; permission?: string }[] = [
    {
      label: t('overviewV2.overview'),
      value: 'key_metrics',
      permission: 'dashboard.overview.view',
    },
    {
      label: t('overviewV2.order'),
      value: 'top_orders',
      permission: 'order.list',
    },
    {
      label: t('overviewV2.machine'),
      value: 'machines',
      permission: 'machine.list',
    },
    {
      label: t('overviewV2.machineStatus'),
      value: 'machine_status',
      permission: 'machine.list',
    },
  ];

  const filteredTabOptions = tabOptions.filter((option) => !option.permission || can(option.permission));

  const [selectedTab, setSelectedTab] = useState<string>(filteredTabOptions[0].value);

  return (
    <Flex
      vertical
      align="end"
      gap={theme.custom.spacing.medium}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <ChipFilter
        quickFilterOptions={quickFilterOptions}
        values={filters}
        onFilterChange={onFilterChange}
        onFilterClick={onFilterClick}
      />

      <Segmented
        options={filteredTabOptions}
        value={selectedTab}
        onChange={(value) => {
          setSelectedTab(value);
        }}
        style={{
          backgroundColor: theme.custom.colors.background.light,
          padding: theme.custom.spacing.xxsmall,
        }}
      />

      {selectedTab === 'key_metrics' && can('dashboard.overview.view') && (
        <StoreKeyMetrics store={store} filters={filters} datetimeFilters={datetimeFilters} />
      )}

      {selectedTab === 'top_orders' && can('order.list') && (
        <TopOrderOverview store={store} filters={filters} datetimeFilters={datetimeFilters} />
      )}

      {selectedTab === 'machines' && can('machine.list') && (
        <MachineOverview store={store} />
      )}

      {selectedTab === 'machine_status' && can('machine.list') && (
        <MachineStatusOverview store={store} filters={filters} />
      )}
    </Flex>
  );
};
