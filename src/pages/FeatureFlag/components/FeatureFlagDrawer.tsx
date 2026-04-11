import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Drawer, Flex, Form, Input, Switch, Typography } from 'antd';

import { useTheme } from '@shared/theme/useTheme';

import { BaseDetailSection } from '@shared/components/BaseDetailSection';

import type {
  CreateFeatureFlagParams,
  FeatureFlag,
  FeatureFlagScopeType,
  UpdateFeatureFlagParams,
} from '@shared/types/featureFlag';

import { normalizeFeatureFlagKey, validateFeatureFlagKey } from '@shared/utils/featureFlagKey';

import { FeatureFlagKeyNamingGuidelines } from './FeatureFlagKeyNamingGuidelines';
import { FeatureFlagScopeSelector } from './FeatureFlagScopeSelector';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  flag?: FeatureFlag;
  loading: boolean;
  onSave: (data: CreateFeatureFlagParams | UpdateFeatureFlagParams) => void;
  onClose: () => void;
}

export const FeatureFlagDrawer: React.FC<Props> = ({
  open,
  mode,
  flag,
  loading,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }
    if (mode === 'edit' && flag) {
      form.setFieldsValue({
        displayName: flag.displayName,
        description: flag.description,
        isEnabled: flag.isEnabled,
        scope: { scopeType: flag.scopeType, scopeIds: flag.scopeIds },
      });
    }
  }, [open, mode, flag, form]);

  const handleFinish = (values: {
    key?: string;
    displayName: string;
    description: string;
    isEnabled: boolean;
    scope: { scopeType: FeatureFlagScopeType; scopeIds: string[] };
  }) => {
    if (mode === 'create') {
      onSave({
        key: normalizeFeatureFlagKey(values.key),
        displayName: values.displayName,
        description: values.description,
        isEnabled: values.isEnabled,
        scopeType: values.scope.scopeType,
        scopeIds: values.scope.scopeIds,
      } satisfies CreateFeatureFlagParams);
    } else {
      onSave({
        displayName: values.displayName,
        description: values.description,
        isEnabled: values.isEnabled,
        scopeType: values.scope.scopeType,
        scopeIds: values.scope.scopeIds,
      } satisfies UpdateFeatureFlagParams);
    }
  };

  return (
    <Drawer
      open={open}
      title={mode === 'create' ? t('featureFlag.createTitle') : t('featureFlag.editTitle')}
      onClose={onClose}
      width={600}
      destroyOnClose
      styles={{
        body: {
          padding: theme.custom.spacing.medium,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      footer={
        <Flex gap={theme.custom.spacing.medium} style={{ width: '100%' }}>
          <Button size="large" onClick={onClose} style={{ width: '100%' }}>
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={() => form.submit()}
            style={{ width: '100%' }}
          >
            {t('common.save')}
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          isEnabled: false,
          scope: { scopeType: 'all', scopeIds: [] },
        }}
        style={{ width: '100%' }}
      >
        <Flex vertical gap={theme.custom.spacing.medium} style={{ width: '100%' }}>
          <FeatureFlagKeyNamingGuidelines />

          <BaseDetailSection title={t('featureFlag.sections.basicInfo')}>
            {mode === 'create' ? (
              <Form.Item
                name="key"
                label={t('featureFlag.fields.key')}
                rules={[
                  {
                    validator: async (_, value) => {
                      const result = validateFeatureFlagKey(value);
                      if (result.valid) {
                        return;
                      }
                      if (result.reason === 'required') {
                        throw new Error(t('featureFlag.validation.keyRequired'));
                      }
                      throw new Error(t('featureFlag.validation.keyFormat'));
                    },
                  },
                ]}
                validateTrigger={[]}
                style={{ width: '100%' }}
              >
                <Input size="large" placeholder="e.g. checkout.new_flow" />
              </Form.Item>
            ) : (
              <Form.Item label={t('featureFlag.fields.key')}>
                <Typography.Text code>{flag?.key}</Typography.Text>
              </Form.Item>
            )}

            <Form.Item
              name="displayName"
              label={t('featureFlag.fields.displayName')}
              rules={[{ required: true, message: t('featureFlag.validation.displayNameRequired') }]}
              style={{ width: '100%' }}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label={t('featureFlag.fields.description')}
              style={{ width: '100%' }}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="isEnabled"
              label={t('featureFlag.fields.enabled')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </BaseDetailSection>

          <BaseDetailSection title={t('featureFlag.sections.scope')}>
            <Form.Item name="scope" label={t('featureFlag.fields.scope')} style={{ width: '100%' }}>
              <FeatureFlagScopeSelector
                value={form.getFieldValue('scope') ?? { scopeType: 'all', scopeIds: [] }}
                onChange={v => form.setFieldValue('scope', v)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </BaseDetailSection>
        </Flex>
      </Form>
    </Drawer>
  );
};
