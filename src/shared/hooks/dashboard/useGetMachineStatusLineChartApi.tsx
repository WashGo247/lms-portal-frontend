import { useCallback, useState } from 'react'

import { getBackendUrl } from '@shared/utils/env'

import { type ApiState } from '@shared/hooks/types';

import axiosClient from '@core/axiosClient';

export type GetMachineStatusLineChartRequest = {
  store_id?: string;
  machine_id?: string;
  start_datetime?: string;
  end_datetime?: string;
}

export type MachineStatusDatapoint = {
  date: string;
  label: string;
  value: string;
}

export type GetMachineStatusLineChartResponse = MachineStatusDatapoint[];

export const useGetMachineStatusLineChartApi = <T = GetMachineStatusLineChartResponse>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const getMachineStatusLineChart = useCallback(async ({ store_id, machine_id, start_datetime, end_datetime }: GetMachineStatusLineChartRequest) => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));

    const url = `${getBackendUrl()}/portal_api/v1/overview/machine-status-line-chart`

    const queryParams = {
      store_id,
      machine_id,
      start_datetime,
      end_datetime,
    }

    try {
      const response = await axiosClient.get<T>(
        url.replace(getBackendUrl(), ''),
        { params: queryParams }
      )

      setState({ data: response.data as T, loading: false, error: null });
      return response.data as T
    } catch (error: any) {
      setState({ data: null, loading: false, error: new Error(error.message) });
      throw error;
    }
  }, [setState]);

  return { ...state, getMachineStatusLineChart };
}
