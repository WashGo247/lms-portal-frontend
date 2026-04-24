import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Drawer, Flex, Form, Input, Select, Skeleton, notification } from 'antd';

import { useTheme } from '@shared/theme/useTheme';
import { GenderEnum } from '@shared/enums/GenderEnum';
import { Box } from '@shared/components/Box';
import { useGetCustomerProfileApi } from '@shared/hooks/customer/useGetCustomerProfileApi';
import { useUpdateCustomerProfileApi } from '@shared/hooks/customer/useUpdateCustomerProfileApi';
import type { CustomerProfile } from '@shared/types/customerProfile';

interface Props {
  profileId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditCustomerDrawer: React.FC<Props> = ({ profileId, isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const { getCustomerProfile, data: profileData, loading: profileLoading, error: profileError } =
    useGetCustomerProfileApi<CustomerProfile>();
  const { updateCustomerProfile, data: updateData, loading: updateLoading, error: updateError } =
    useUpdateCustomerProfileApi<CustomerProfile>();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      await updateCustomerProfile(profileId, form.getFieldsValue());
    } catch {
      return;
    }
  };

  useEffect(() => {
    if (isOpen && profileId) {
      getCustomerProfile(profileId);
    }
  }, [isOpen, profileId]);

  useEffect(() => {
    if (profileData) {
      form.setFieldsValue({
        full_name: profileData.full_name,
        email: profileData.email,
        phone_number: profileData.phone_number,
        gender: profileData.gender,
        address: profileData.address,
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (!updateData) return;
    onClose();
    api.success({ message: t('messages.updateSuccess') });
    onSuccess();
  }, [updateData]);

  useEffect(() => {
    if (profileError) api.error({ message: t('messages.getError') });
  }, [profileError]);

  useEffect(() => {
    if (updateError) api.error({ message: t('messages.updateError') });
  }, [updateError]);

  return (
    <Drawer
      title={t('customer.editCustomer')}
      placement="right"
      open={isOpen}
      onClose={onClose}
      width={600}
      styles={{
        body: { padding: theme.custom.spacing.medium, display: 'flex', flexDirection: 'column' },
      }}
      footer={
        <Flex justify="flex-end" gap={theme.custom.spacing.medium} style={{ width: '100%' }}>
          <Button type="default" size="large" onClick={onClose} style={{ width: '100%' }}>
            {t('common.cancel')}
          </Button>
          <Button type="primary" size="large" onClick={handleSubmit} loading={updateLoading} style={{ width: '100%' }}>
            {t('common.update')}
          </Button>
        </Flex>
      }
    >
      {contextHolder}
      <Box vertical gap={theme.custom.spacing.medium} style={{ width: '100%', height: '100%' }}>
        {profileLoading && <Skeleton active />}
        {!profileLoading && profileData && (
          <Form form={form} layout="vertical" style={{ width: '100%' }}>
            <Form.Item label={t('customer.fullName')} name="full_name">
              <Input size="large" />
            </Form.Item>
            <Form.Item label={t('common.email')} name="email">
              <Input size="large" />
            </Form.Item>
            <Form.Item label={t('common.phone')} name="phone_number">
              <Input size="large" />
            </Form.Item>
            <Form.Item label={t('customer.gender')} name="gender">
              <Select
                size="large"
                allowClear
                style={{ width: '100%' }}
                options={[
                  { label: t('customer.genderMale'), value: GenderEnum.MALE },
                  { label: t('customer.genderFemale'), value: GenderEnum.FEMALE },
                  { label: t('customer.genderOther'), value: GenderEnum.OTHER },
                ]}
              />
            </Form.Item>
            <Form.Item label={t('customer.address')} name="address">
              <Input size="large" />
            </Form.Item>
          </Form>
        )}
      </Box>
    </Drawer>
  );
};
