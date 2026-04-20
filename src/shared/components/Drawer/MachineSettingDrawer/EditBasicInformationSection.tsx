import React from 'react';
import { useTranslation } from 'react-i18next';

import { Typography, Form, type FormInstance, Input, InputNumber, Select } from 'antd';

import { useTheme } from '@shared/theme/useTheme';

import { Box } from '@shared/components/Box';
import { MachineTypeEnum } from '@shared/enums/MachineTypeEnum';
import { DynamicTag } from '@shared/components/DynamicTag';

interface Props {
  form: FormInstance;
  onChange: (values: any) => void;
}

export const EditBasicInformationSection: React.FC<Props> = ({ form, onChange }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const machineType = Form.useWatch('machine_type', form);

  return (
    <Box
      vertical
      gap={theme.custom.spacing.medium}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Typography.Text strong>{t('common.basicInformation')}</Typography.Text>

      <Form
        form={form}
        layout="vertical"
        style={{
          width: '100%',
          height: '100%',
        }}
        onChange={onChange}
      >
        <Form.Item
          label={t('common.name')}
          name="name"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.nameIsRequired') }]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label={t('common.machineType')}
          name="machine_type"
          style={{ width: '100%' }}
          rules={[{ required: true, message: t('common.machineTypeIsRequired') }]}
        >
          <Select size="large" style={{ width: '100%' }}>
            <Select.Option value={MachineTypeEnum.WASHER}>
              <DynamicTag value={MachineTypeEnum.WASHER} type="text"/>
            </Select.Option>
            <Select.Option value={MachineTypeEnum.DRYER}>
              <DynamicTag value={MachineTypeEnum.DRYER} type="text"/>
            </Select.Option>
          </Select>
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
    </Box>
  );
};

