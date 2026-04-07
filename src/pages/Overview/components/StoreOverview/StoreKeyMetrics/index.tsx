import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, Skeleton } from 'antd';

import {
  CashOut,
  CartCheck,
  CheckCircle,
} from '@solar-icons/react';

import { useTheme } from '@shared/theme/useTheme';

import type { Store } from '@shared/types/store';

import {
  useGetDashboardOverviewKeyMetricsApi
} from '@shared/hooks/dashboard/useGetDashboardOverviewKeyMetricsApi';

import { KeyMetricList } from './KeyMetricList';

import type { StoreKeyMetrics as StoreKeyMetricsType } from './types';
import { LiquidKeyMetricList } from './LiquidKeyMetricList';
import formatCurrencyCompact from '@shared/utils/currency';
import { BaseSectionTitle } from '@shared/components/BaseSectionTitle';

import dayjs from '@shared/utils/dayjs';

interface Props {
  store: Store;
  filters: Record<string, any>;
  datetimeFilters?: {
    start_datetime: string;
    end_datetime: string;
  };
}

export const StoreKeyMetrics: React.FC<Props> = ({ store, filters, datetimeFilters }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [keyMetrics, setKeyMetrics] = useState<StoreKeyMetricsType[]>([]);
  const [liquidKeyMetrics, setLiquidKeyMetrics] = useState<StoreKeyMetricsType[]>([]);

  const {
    getDashboardOverviewKeyMetrics,
    data: dashboardOverviewKeyMetrics,
    loading: dashboardOverviewKeyMetricsLoading,
  } = useGetDashboardOverviewKeyMetricsApi();

  const dateLabel = () => {
    const today = dayjs.tz();
    const filterStart = filters.start_datetime ? dayjs.tz(filters.start_datetime) : null;
    const filterEnd = filters.end_datetime ? dayjs.tz(filters.end_datetime) : null;

    if (filterStart && filterEnd) {
      if (filterStart.isSame(today, 'day') && filterEnd.isSame(today, 'day')) {
        return t('overviewV2.today');
      } else if (filterStart.isSame(today.subtract(1, 'day'), 'day') && filterEnd.isSame(today.subtract(1, 'day'), 'day')) {
        return t('overviewV2.yesterday');
      } else if (filterStart.isSame(today.startOf('week'), 'day') && filterEnd.isSame(today.endOf('week'), 'day')) {
        return t('overviewV2.thisWeek');
      } else if (filterStart.isSame(today.startOf('month'), 'day') && filterEnd.isSame(today.endOf('month'), 'day')) {
        return t('overviewV2.thisMonth');
      }
    }

    return '';
  };

  const handleGetDashboardOverviewKeyMetrics = async () => {
    const queryParams = {
      store_id: store.id,
    } as Record<string, any>;

    // Use datetime filters from MoreFilterDrawer if provided, otherwise use chip filter dates
    const hasCustomDatetime = (datetimeFilters?.start_datetime && datetimeFilters.start_datetime !== '') ||
                              (datetimeFilters?.end_datetime && datetimeFilters.end_datetime !== '');

    if (hasCustomDatetime) {
      // If custom datetime filters are set, use them (can be undefined if cleared)
      queryParams.start_date = datetimeFilters?.start_datetime && datetimeFilters.start_datetime !== ''
        ? datetimeFilters.start_datetime
        : undefined;
      queryParams.end_date = datetimeFilters?.end_datetime && datetimeFilters.end_datetime !== ''
        ? datetimeFilters.end_datetime
        : undefined;
    } else {
      // Use chip filter dates
      if (filters.start_datetime && filters.start_datetime !== '') {
        queryParams.start_date = filters.start_datetime;
      }
      if (filters.end_datetime && filters.end_datetime !== '') {
        queryParams.end_date = filters.end_datetime;
      }
    }

    await getDashboardOverviewKeyMetrics(queryParams);
  };

  useEffect(() => {
    handleGetDashboardOverviewKeyMetrics();
  }, [filters, datetimeFilters]);

  useEffect(() => {
    if (!dashboardOverviewKeyMetrics) return;

    setKeyMetrics([
      {
        label: t('overviewV2.revenue', { date: dateLabel() }),
        value: formatCurrencyCompact(dashboardOverviewKeyMetrics.revenue_by_day),
        icon: <CashOut size={32} weight="BoldDuotone" />,
      },
      {
        label: t('overviewV2.totalOrders', { date: dateLabel() }),
        value: `${dashboardOverviewKeyMetrics.total_in_progress_orders} / ${dashboardOverviewKeyMetrics.today_orders}`,
        icon: <CartCheck size={32} weight="BoldDuotone" />,
      },
      {
        label: t('overviewV2.finishedOrdersRate', { date: dateLabel() }),
        value: dashboardOverviewKeyMetrics.today_orders > 0 ? `${Math.round((dashboardOverviewKeyMetrics.total_finished_orders / dashboardOverviewKeyMetrics.today_orders) * 100)}%` : '0%',
        icon: <CheckCircle size={32} weight="BoldDuotone" />,
      },
    ]);

    setLiquidKeyMetrics([
      {
        label: t('overviewV2.totalWashers'),
        value: dashboardOverviewKeyMetrics.total_in_progress_washers / dashboardOverviewKeyMetrics.total_washers * 100,
        description: t('overviewV2.totalWashersDescription'),
      },
      {
        label: t('overviewV2.totalDryers'),
        value: dashboardOverviewKeyMetrics.total_in_progress_dryers / dashboardOverviewKeyMetrics.total_dryers * 100,
        description: t('overviewV2.totalDryersDescription'),
      },
    ]);
  }, 
  [dashboardOverviewKeyMetrics]);

  return (
    <Flex vertical gap={theme.custom.spacing.medium} style={{ width: '100%' }}>
      <BaseSectionTitle
        title={t('overviewV2.keyMetrics')}
        onRefresh={handleGetDashboardOverviewKeyMetrics}
      />

      {dashboardOverviewKeyMetricsLoading ? (
        <Skeleton active style={{ width: '100%' }} />
      ) : (
        <>
          <KeyMetricList keyMetrics={keyMetrics} />
          <LiquidKeyMetricList keyMetrics={liquidKeyMetrics} />
        </>
      )}
    </Flex>
  );
};
