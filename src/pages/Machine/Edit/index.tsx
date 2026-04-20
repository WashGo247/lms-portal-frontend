import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Flex,
  Skeleton,
  notification,
  type FormInstance,
} from 'antd';

import { useTheme } from '@shared/theme/useTheme';

import { type Machine } from '@shared/types/machine';

import {
  useGetMachineApi,
  type GetMachineResponse,
} from '@shared/hooks/useGetMachineApi';
import {
  useUpdateMachinePortalApi,
  type UpdateMachinePortalResponse,
} from '@shared/hooks/useUpdateMachinePortalApi';

import { PortalLayoutV2 } from '@shared/components/layouts/PortalLayoutV2';
import { EditSection } from './EditSection';

export const MachineEditPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const [api, contextHolder] = notification.useNotification();

  const machineId = useParams().id as string;

  const {
    getMachine,
    data: machineData,
    loading: machineLoading,
    error: machineError,
  } = useGetMachineApi<GetMachineResponse>();
  const {
    updateMachine,
    data: updateMachineData,
    error: updateMachineError,
  } = useUpdateMachinePortalApi<UpdateMachinePortalResponse>();

  const onSave = (form: FormInstance) => {
    updateMachine(machineId, {
      name: form.getFieldValue('name'),
      machine_type: form.getFieldValue('machine_type'),
      base_price: form.getFieldValue('base_price'),
      status: form.getFieldValue('status'),
      pulse_duration: form.getFieldValue('pulse_duration'),
      pulse_interval: form.getFieldValue('pulse_interval'),
      coin_value: form.getFieldValue('coin_value'),
      capacity_kg: form.getFieldValue('capacity_kg') ?? null,
      estimated_duration_minutes: form.getFieldValue('estimated_duration_minutes') ?? null,
    });
  }

  useEffect(() => {
    if (machineError) {
      api.error({
        message: t('messages.getMachineError'),
      });
    }
  }, [machineError]);

  useEffect(() => {
    if (updateMachineError) {
      api.error({
        message: t('messages.updateMachineError'),
      });
    }
  }, [updateMachineError]);

  useEffect(() => {
    if (updateMachineData) {
      api.success({
        message: t('messages.updateMachineSuccess'),
      });

      navigate(`/machines/${machineId}/detail`);
    }
  }, [updateMachineData]);

  useEffect(() => {
    if (machineId) {
      getMachine(machineId);
    }
  }, [machineId]);

  return (
    <PortalLayoutV2 title={machineData?.name || machineId} onBack={() => navigate(-1)}>
      {contextHolder}

      <Flex vertical gap={theme.custom.spacing.medium} style={{ height: '100%' }}>
        {machineLoading && <Skeleton active />}

        {!machineLoading && machineData && (
          <>
            <EditSection
              machine={machineData as Machine}
              onSave={onSave}
            />
          </>
        )}
      </Flex>
    </PortalLayoutV2>
  );
};
