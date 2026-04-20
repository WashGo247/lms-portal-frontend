import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, Form, Input, Select, Spin, Typography, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';

import { CloudUpload } from '@solar-icons/react';

import { type Store } from '@shared/types/store';
import { StoreStatusEnum } from '@shared/enums/StoreStatusEnum';
import { useTheme } from '@shared/theme/useTheme';
import { useUploadStoreLogoApi, type UploadStoreLogoResponse } from '@shared/hooks/useUploadStoreLogoApi';

import { BaseEditSection } from '@shared/components/BaseEditSection';

interface Props {
  store: Store;
  onChange: (values: any) => void;
  onSave: () => void;
}

export const DetailEditSection: React.FC<Props> = ({ store, onChange, onSave }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [form] = Form.useForm();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>(store.logo_url ?? '');

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
        onChange({ ...form.getFieldsValue(), logo_url: result.url });
      }
    } catch (_) {
      // uploadError state already set by the hook
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      id: store.id,
      name: store.name,
      address: store.address,
      contact_phone_number: store.contact_phone_number,
      status: store.status,
      logo_url: store.logo_url ?? '',
    });
    setLogoPreviewUrl(store.logo_url ?? '');
  }, [store]);

  return (
    <BaseEditSection title={t('common.basicInformation')} onSave={onSave}>
      <Form
        form={form}
        layout="vertical"
        style={{ width: '100%', maxWidth: 600 }}
        onValuesChange={(_, values) => onChange(values)}
      >
        <Form.Item label={t('common.name')} name="name" style={{ width: '100%' }} rules={[{ required: true, message: t('common.nameIsRequired') }]}>
          <Input size="large" />
        </Form.Item>

        <Form.Item label={t('common.status')} name="status" style={{ width: '100%' }} rules={[{ required: true, message: t('common.statusIsRequired') }]}>
          <Select
            size="large"
            style={{ width: '100%' }}
            options={[
              { label: t('common.active'), value: StoreStatusEnum.ACTIVE },
              { label: t('common.inactive'), value: StoreStatusEnum.INACTIVE },
            ]}
          />
        </Form.Item>

        <Form.Item label={t('common.address')} name="address" style={{ width: '100%' }} rules={[{ required: true, message: t('common.addressIsRequired') }]}>
          <Input size="large" />
        </Form.Item>

        <Form.Item label={t('common.contactPhoneNumber')} name="contact_phone_number" style={{ width: '100%' }} rules={[{ required: true, message: t('common.contactPhoneNumberIsRequired') }]}>
          <Input size="large" type="number" />
        </Form.Item>

        <Form.Item label={t('common.logo')} style={{ width: '100%' }}>
          <Flex vertical gap={theme.custom.spacing.small}>
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              customRequest={handleLogoUpload}
              accept=".svg,.png,image/svg+xml,image/png"
              beforeUpload={(file) => {
                const allowed = ['image/svg+xml', 'image/png'];
                if (!allowed.includes(file.type)) {
                  return Upload.LIST_IGNORE;
                }
                if (file.size > 5 * 1024 * 1024) {
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
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
      </Form>
    </BaseEditSection>
  );
};
