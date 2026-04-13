import React from 'react';

import { Flex } from 'antd';

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

export const DesktopView: React.FC<Props> = ({
  store,
  quickFilterOptions,
  filters,
  onFilterChange,
  onFilterClick,
  datetimeFilters,
}) => {
  const theme = useTheme();
  const can = useCan();

  return (
    <Flex
      vertical
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
        style={{ justifyContent: 'flex-end' }}
      />

      {can('dashboard.overview.view') && (
        <StoreKeyMetrics
          store={store}
          filters={filters}
          datetimeFilters={datetimeFilters}
        />
      )}

      {can('order.list') && (
        <TopOrderOverview
          store={store}
          filters={filters}
          datetimeFilters={datetimeFilters}
        />
      )}

      {can('machine.list') && <MachineOverview store={store} />}

      {can('machine.list') && <MachineStatusOverview store={store} filters={filters} />}
    </Flex>
  );
};
