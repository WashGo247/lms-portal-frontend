import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, Form, Input, Select, Spin, Typography, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';

import { CloudUpload } from '@solar-icons/react';

import { useTheme } from '@shared/theme/useTheme';

import { userStorage } from '@core/storage/userStorage';
import { tenantStorage } from '@core/storage/tenantStorage';

import { useListTenantApi, type ListTenantResponse } from '@shared/hooks/useListTenantApi';
import { useCreateStoreApi, type CreateStoreResponse } from '@shared/hooks/useCreateStoreApi';
import { useUploadStoreLogoApi, type UploadStoreLogoResponse } from '@shared/hooks/useUploadStoreLogoApi';

import { BaseEditSection } from '@shared/components/BaseEditSection';

interface Props {
  onSuccess: () => void;
  onError: () => void;
}

export const AddSection: React.FC<Props> = ({ onSuccess, onError }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [form] = Form.useForm();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  const user = userStorage.load();
  const tenant = tenantStorage.load();
  const [tenantOptions, setTenantOptions] = useState<any[]>([]);

  const { data: listTenantData, loading: listTenantLoading, listTenant } = useListTenantApi<ListTenantResponse>();
  const { createStore, data: createStoreData, error: createStoreError } = useCreateStoreApi<CreateStoreResponse>();
  const {
    uploadStoreLogo,
    loading: uploadLoading,
    error: uploadError,
  } = useUploadStoreLogoApi<UploadStoreLogoResponse>();

  const handleLogoUpload = async (options: any) => {
    try {
      const result = await uploadStoreLogo({ file: options.file as RcFile });
      if (result?.url) {
        setLogoPreviewUrl(result.url);
      }
    } catch (_) {
      // uploadError state already set by the hook
    }
  };

  const handleSave = () => {
    createStore({
      name: form.getFieldValue('name'),
      contact_phone_number: form.getFieldValue('contact_phone_number'),
      address: form.getFieldValue('address'),
      tenant_id: form.getFieldValue('tenant_id') || tenant?.id,
      logo_url: logoPreviewUrl || null,
    });
  };

  useEffect(() => {
    if (createStoreData) onSuccess();
  }, [createStoreData]);

  useEffect(() => {
    if (createStoreError) onError();
  }, [createStoreError]);

  useEffect(() => {
    if (listTenantData) {
      setTenantOptions(listTenantData.data.map((item) => ({ label: item.name, value: item.id })));
    }
  }, [listTenantData]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      listTenant({ page: 1, page_size: 100 });
    } else if (tenant) {
      setTenantOptions([{ label: tenant.name, value: tenant.id }]);
      form.setFieldsValue({ tenant_id: tenant.id });
    }
  }, [user, tenant, form]);

  return (
    <BaseEditSection title={t('common.basicInformation')} saveButtonText={t('common.add')} onSave={handleSave}>
      <Form form={form} layout="vertical" style={{ width: '100%', maxWidth: 600 }}>
        <Form.Item name="name" label={t('common.name')} rules={[{ required: true, message: t('messages.nameIsRequired') }]}>
          <Input size="large" />
        </Form.Item>

        <Form.Item name="contact_phone_number" label={t('common.phone')} rules={[{ required: true, message: t('messages.phoneIsRequired') }]}>
          <Input size="large" />
        </Form.Item>

        <Form.Item name="address" label={t('common.address')} rules={[{ required: true, message: t('messages.addressIsRequired') }]}>
          <Input size="large" />
        </Form.Item>

        <Form.Item label={t('common.logo')}>
          <Flex vertical gap={theme.custom.spacing.small}>
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              customRequest={handleLogoUpload}
              accept="image/*"
            >
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt="Store logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <Flex vertical align="center" justify="center" gap={theme.custom.spacing.xsmall}>
                  {uploadLoading ? <Spin size="small" /> : <CloudUpload size={24} weight="BoldDuotone" />}
                  <Typography.Text style={{ fontSize: theme.custom.fontSize.small }}>
                    {uploadLoading ? t('common.uploading') : t('common.upload')}
                  </Typography.Text>
                </Flex>
              )}
            </Upload>

            {uploadError && (
              <Typography.Text style={{ color: theme.custom.colors.danger.default, fontSize: theme.custom.fontSize.small }}>
                {t('messages.uploadLogoError')}
              </Typography.Text>
            )}
          </Flex>
        </Form.Item>

        {user?.role === 'admin' && (
          <Form.Item name="tenant_id" label={t('common.tenant')} rules={[{ required: true, message: t('messages.tenantIsRequired') }]}>
            <Select size="large" options={tenantOptions} loading={listTenantLoading} disabled={user?.role !== 'admin'} />
          </Form.Item>
        )}
      </Form>
    </BaseEditSection>
  );
};
