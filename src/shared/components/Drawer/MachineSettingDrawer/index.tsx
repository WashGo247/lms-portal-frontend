import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Drawer, Flex, Form, Button, notification, Typography } from 'antd';

import { useTheme } from '@shared/theme/useTheme';

import { type Machine } from '@shared/types/machine';

import {
  useUpdateMachinePortalApi,
  type UpdateMachinePortalResponse,
} from '@shared/hooks/useUpdateMachinePortalApi';

import { EditBasicInformationSection } from './EditBasicInformationSection';
import { EditMachineConfigSection } from './EditMachineConfigSection';
import { EditPriceSection } from './EditPriceSection';

interface Props {
  machine: Machine;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: () => void;
}

export const MachineSettingDrawer: React.FC<Props> = ({
  machine,
  isDrawerOpen,
  setIsDrawerOpen,
  onSave,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [api, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const {
    updateMachine,
    data: updateMachineData,
    loading: updateMachineLoading,
    error: updateMachineError,
  } = useUpdateMachinePortalApi<UpdateMachinePortalResponse>();

  const handleUpdateMachine = async () => {
    const values = form.getFieldsValue();
    await updateMachine(machine.id, {
      ...values,
      capacity_kg: values.capacity_kg ?? null,
      estimated_duration_minutes: values.estimated_duration_minutes ?? null,
    });
    onSave?.();
  }

  const handleOnChange = (values: any) => {
    const currentValues = form.getFieldsValue();
    form.setFieldsValue({ ...currentValues, ...values });
  }

  useEffect(() => {
    form.setFieldsValue({
      name: machine.name,
      status: machine.status,
      machine_type: machine.machine_type,
      base_price: machine.base_price,
      coin_value: machine.coin_value,
      pulse_duration: machine.pulse_duration,
      pulse_interval: machine.pulse_interval,
      capacity_kg: machine.capacity_kg,
      estimated_duration_minutes: machine.estimated_duration_minutes,
    });
  }, [machine, form]);

  useEffect(() => {
    if (!updateMachineData) return;

    setIsDrawerOpen(false);

    api.success({
      message: t('messages.updateMachineSuccess'),
    });
  }, [updateMachineData]);

  useEffect(() => {
    if (!updateMachineError) return;

    api.error({
      message: t('messages.updateMachineError'),
    });
  }, [updateMachineError]);

  return (
    <Drawer
      title={t('common.machineEdit')}
      placement="right"
      onClose={() => setIsDrawerOpen(false)}
      open={isDrawerOpen}
      width={480}
      styles={{
        body: {
          padding: theme.custom.spacing.medium,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {contextHolder}

      <Flex
        vertical
        gap={theme.custom.spacing.medium}
        style={{ width: '100%', height: '100%' }}
      >
        <Flex
          vertical
          gap={theme.custom.spacing.medium}
          style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <EditBasicInformationSection
            form={form}
            onChange={handleOnChange}
          />

          <EditPriceSection
            form={form}
            onChange={handleOnChange}
          />

          <EditMachineConfigSection
            form={form}
            onChange={handleOnChange}
          />
        </Flex>

        <Flex justify="flex-end" gap={theme.custom.spacing.medium} style={{ width: '100%', marginTop: 'auto' }}>
          <Button
            type="default"
            size="large"
            onClick={() => setIsDrawerOpen(false)}
            style={{ width: '100%' }}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="primary"
            size="large"
            onClick={handleUpdateMachine}
            loading={updateMachineLoading}
            style={{ width: '100%' }}
          >
            {t('common.update')}
          </Button>
        </Flex>
      </Flex>
    </Drawer>
  );
};

