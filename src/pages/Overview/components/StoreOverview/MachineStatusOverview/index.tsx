import React, { useCallback, useEffect, useMemo } from 'react';

import dayjs from '@shared/utils/dayjs';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { useListMachineApi, type ListMachineResponse } from '@shared/hooks/useListMachineApi';
import {
  useGetMachineStatusLineChartApi,
  type GetMachineStatusLineChartResponse,
  type MachineStatusDatapoint,
} from '@shared/hooks/dashboard/useGetMachineStatusLineChartApi';

import type { Store } from '@shared/types/store';

import { DesktopView } from './DesktopView';
import { MobileView } from './MobileView';

interface Props {
  store: Store;
  filters: Record<string, any>;
}

export const MachineStatusOverview: React.FC<Props> = ({ store, filters }) => {
  const isMobile = useIsMobile();

  const {
    listMachine,
    data: listMachineData,
    loading: listMachineLoading,
  } = useListMachineApi<ListMachineResponse>();

  const {
    getMachineStatusLineChart,
    data: chartData,
    loading: chartLoading,
  } = useGetMachineStatusLineChartApi<GetMachineStatusLineChartResponse>();

  const fetchMachines = useCallback(() => {
    listMachine({
      store_id: store.id,
      page: 1,
      page_size: 100,
      order_by: 'relay_no',
      order_direction: 'asc',
    });
  }, [store.id]);

  const fetchChartData = useCallback(() => {
    const now = dayjs();
    getMachineStatusLineChart({
      store_id: store.id,
      start_date: now.subtract(1, 'hour').toISOString(),
      end_date: now.toISOString(),
    });
  }, [store.id]);

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, []);

  const chartDataByLabel = useMemo(() => {
    if (!chartData) return {};
    return chartData.reduce<Record<string, MachineStatusDatapoint[]>>((acc, d) => {
      if (!acc[d.label]) acc[d.label] = [];
      acc[d.label].push(d);
      return acc;
    }, {});
  }, [chartData]);

  const handleRefresh = useCallback(() => {
    fetchMachines();
    fetchChartData();
  }, [fetchMachines, fetchChartData]);

  const viewProps = {
    machines: listMachineData?.data ?? [],
    loading: listMachineLoading,
    chartDataByLabel,
    chartLoading,
    onRefresh: handleRefresh,
  };

  return isMobile ? <MobileView {...viewProps} /> : <DesktopView {...viewProps} />;
};
