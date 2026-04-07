import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@shared/hooks/useIsMobile';

import type { Store } from '@shared/types/store';

import { type QuickFilterOption } from '@shared/components/ChipFilterComponent';

import dayjs from '@shared/utils/dayjs';

import { MobileView } from './MobileView';
import { DesktopView } from './DesktopView';

interface Props {
  store: Store;
  onFilterClick?: () => void;
  datetimeFilters?: {
    start_datetime: string;
    end_datetime: string;
  };
}

export const StoreOverview: React.FC<Props> = ({ store, onFilterClick, datetimeFilters }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const quickFilterOptions: QuickFilterOption[] = [
    {
      label: t('overviewV2.today'),
      value: 'today',
      filter: {
        start_datetime: dayjs.tz().startOf('day').toISOString(),
        end_datetime: dayjs.tz().endOf('day').toISOString(),
      },
    },
    {
      label: t('overviewV2.yesterday'),
      value: 'yesterday',
      filter: {
        start_datetime: dayjs.tz().subtract(1, 'day').startOf('day').toISOString(),
        end_datetime: dayjs.tz().subtract(1, 'day').endOf('day').toISOString(),
      },
    },
    {
      label: t('overviewV2.thisWeek'),
      value: 'this_week',
      filter: {
        start_datetime: dayjs.tz().startOf('week').toISOString(),
        end_datetime: dayjs.tz().endOf('week').toISOString(),
      },
    },
    {
      label: t('overviewV2.thisMonth'),
      value: 'this_month',
      filter: {
        start_datetime: dayjs.tz().startOf('month').toISOString(),
        end_datetime: dayjs.tz().endOf('month').toISOString(),
      },
    },
    {
      label: t('common.all'),
      value: 'all',
      filter: {},
    },
  ];

  const [filters, setFilters] = useState<Record<string, any>>({
    start_datetime: dayjs.tz().startOf('day').toISOString(),
    end_datetime: dayjs.tz().endOf('day').toISOString(),
  });

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const hasCustomDatetime = (datetimeFilters?.start_datetime && datetimeFilters.start_datetime !== '') ||
                            (datetimeFilters?.end_datetime && datetimeFilters.end_datetime !== '');

  const effectiveFilters = hasCustomDatetime ? datetimeFilters : {
    start_datetime: filters.start_datetime || '',
    end_datetime: filters.end_datetime || '',
  };

  return isMobile ? (
    <MobileView
      store={store}
      quickFilterOptions={quickFilterOptions}
      filters={filters}
      onFilterChange={handleFilterChange}
      onFilterClick={onFilterClick}
      datetimeFilters={effectiveFilters}
    />
  ) : (
    <DesktopView
      store={store}
      quickFilterOptions={quickFilterOptions}
      filters={filters}
      onFilterChange={handleFilterChange}
      onFilterClick={onFilterClick}
      datetimeFilters={effectiveFilters}
    />
  );
};
