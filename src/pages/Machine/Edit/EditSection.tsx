import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Form,
  Input,
  InputNumber,
  Select,
  type FormInstance,
} from 'antd';

import { type Machine } from '@shared/types/machine';
import { MachineTypeEnum } from '@shared/enums/MachineTypeEnum';
import { MachineStatusEnum } from '@shared/enums/MachineStatusEnum';

import { BaseEditSection } from '@shared/components/BaseEditSection';

interface Props {
  machine: Machine;
  onSave: (form: FormInstance) => void;
}

export const EditSection: React.FC<Props> = ({ machine, onSave }: Props) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const machineType = Form.useWatch('machine_type', form);

  useEffect(() => {
    form.setFieldsValue({
      id: machine.id,
      name: machine.name,
      machine_type: machine.machine_type,
      base_price: machine.base_price,
      status: machine.status,
      relay_no: machine.relay_no,
      pulse_duration: machine.pulse_duration,
      pulse_interval: machine.pulse_interval,
      coin_value: machine.coin_value,
      capacity_kg: machine.capacity_kg,
      estimated_duration_minutes: machine.estimated_duration_minutes,
    });
  }, [machine]);

  return (
    <BaseEditSection title={t('common.basicInformation')} onSave={() => onSave(form)}>
      <Form form={form} layout="vertical" style={{ width: '100%', maxWidth: 600 }}>
        <Form.Item
          label={t('common.machineId')}
          name="id"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.machineIdIsRequired') }]}
        >
          <Input size="large" disabled />
        </Form.Item>

        <Form.Item
          label={t('common.relayNo')}
          name="relay_no"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.relayNoIsRequired') }]}
        >
          <Input size="large" disabled />
        </Form.Item>

        <Form.Item
          label={t('common.name')}
          name="name"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.nameIsRequired') }]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label={t('common.pulseDuration')}
          name="pulse_duration"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.pulseDurationIsRequired') }]}
        >
          <InputNumber size="large" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label={t('common.pulseInterval')}
          name="pulse_interval"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.pulseIntervalIsRequired') }]}
        >
          <InputNumber size="large" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label={t('common.coinValue')}
          name="coin_value"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.coinValueIsRequired') }]}
        >
          <InputNumber size="large" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label={t('common.status')}
          name="status"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.statusIsRequired') }]}
        >
          <Select
            size="large"
            style={{ width: '100%' }}
            options={[
              { label: t('common.pendingSetup'), value: MachineStatusEnum.PENDING_SETUP },
              { label: t('common.idle'), value: MachineStatusEnum.IDLE },
              { label: t('common.starting'), value: MachineStatusEnum.STARTING },
              { label: t('common.busy'), value: MachineStatusEnum.BUSY },
              { label: t('common.outOfService'), value: MachineStatusEnum.OUT_OF_SERVICE },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={t('common.machineType')}
          name="machine_type"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.machineTypeIsRequired') }]}
        >
          <Select
            size="large"
            style={{ width: '100%' }}
            options={[
              { label: t('common.washer'), value: MachineTypeEnum.WASHER },
              { label: t('common.dryer'), value: MachineTypeEnum.DRYER },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={t('common.basePrice')}
          name="base_price"
          style={{ width: '100%' }}
          rules={[
            { required: true, message: t('messages.basePriceIsRequired') },
            {
              validator: (_, value) => {
                if (value <= 0) {
                  return Promise.reject(new Error(t('messages.basePriceMustBeGreaterThanZero')));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <InputNumber
            size="large"
            style={{ width: '100%' }}
            placeholder={t('messages.enterBasePrice')}
            min={0}
            addonAfter="đ"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => {
              const cleaned = value?.replace(/,/g, '') || '';
              return (cleaned === '' ? 0 : Number(cleaned)) as 0;
            }}
          />
        </Form.Item>

        <Form.Item
          label={t('common.capacityKg')}
          name="capacity_kg"
          style={{ width: '100%' }}
        >
          <InputNumber size="large" style={{ width: '100%' }} min={0.1} step={0.5} addonAfter="kg" />
        </Form.Item>

        {machineType === MachineTypeEnum.WASHER && (
          <Form.Item
            label={t('common.estimatedDurationMinutes')}
            name="estimated_duration_minutes"
            style={{ width: '100%' }}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={1} addonAfter={t('common.minutes')} />
          </Form.Item>
        )}
      </Form>
    </BaseEditSection>
  );
};
