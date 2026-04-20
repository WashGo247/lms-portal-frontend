import { useCallback, useState } from 'react';

import axiosClient from '@core/axiosClient';

import { type ApiState } from '@shared/hooks/types';
import { type Machine } from '@shared/types/machine';
import { type MachineTypeEnum } from '@shared/enums/MachineTypeEnum';

export type UpdateMachinePortalRequest = {
  name?: string;
  machine_type?: MachineTypeEnum;
  base_price?: number;
  status?: string;
  pulse_duration?: number;
  pulse_interval?: number;
  coin_value?: number;
  capacity_kg?: number | null;
  estimated_duration_minutes?: number | null;
};

export type UpdateMachinePortalResponse = Machine;

export async function updateMachinePortalApi(
  machine_id: string,
  payload: UpdateMachinePortalRequest,
): Promise<UpdateMachinePortalResponse> {
  const res = await axiosClient.patch<UpdateMachinePortalResponse>(
    `/portal_api/v1/machines/${machine_id}`,
    payload,
  );
  return res.data;
}

export const useUpdateMachinePortalApi = <T = UpdateMachinePortalResponse>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateMachine = useCallback(async (
    machine_id: string,
    payload: UpdateMachinePortalRequest,
  ): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await updateMachinePortalApi(machine_id, payload);
      setState({ data: data as T, loading: false, error: null });
      return data as T;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, loading: false, error: err });
      throw err;
    }
  }, []);

  return { ...state, updateMachine };
};
