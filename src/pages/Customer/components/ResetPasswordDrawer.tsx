import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Drawer, Flex, Form, Input, notification } from 'antd';

import { useTheme } from '@shared/theme/useTheme';
import { Box } from '@shared/components/Box';
import { useResetCustomerPasswordApi } from '@shared/hooks/customer/useResetCustomerPasswordApi';

interface Props {
  profileId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetPasswordDrawer: React.FC<Props> = ({ profileId, isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const { resetCustomerPassword, loading: resetLoading, error: resetError } =
    useResetCustomerPasswordApi();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      await resetCustomerPassword(profileId, form.getFieldValue('password'));
      onClose();
      form.resetFields();
      api.success({ message: t('messages.resetPasswordSuccess') });
      onSuccess();
    } catch {
      // error notification handled by useEffect below
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
    }
  }, [isOpen]);

  useEffect(() => {
    if (resetError) api.error({ message: t('messages.resetPasswordError') });
  }, [resetError]);

  return (
    <Drawer
      title={t('common.userResetPassword')}
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
          <Button type="primary" size="large" onClick={handleSubmit} loading={resetLoading} style={{ width: '100%' }}>
            {t('common.resetPassword')}
          </Button>
        </Flex>
      }
    >
      {contextHolder}
      <Box vertical gap={theme.custom.spacing.medium} style={{ width: '100%', height: '100%' }}>
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            label={t('common.password')}
            name="password"
            rules={[
              { required: true, message: t('messages.passwordIsRequired') },
              { min: 8, message: t('messages.passwordMustBeAtLeastEightCharacters') },
              { pattern: /[A-Z]/, message: t('messages.passwordMustContainUppercase') },
              { pattern: /[a-z]/, message: t('messages.passwordMustContainLowercase') },
              { pattern: /[0-9]/, message: t('messages.passwordMustContainNumber') },
              { pattern: /[^A-Za-z0-9]/, message: t('messages.passwordMustContainSpecialCharacter') },
            ]}
          >
            <Input.Password size="large" placeholder={t('common.password')} />
          </Form.Item>
          <Form.Item
            label={t('common.passwordConfirm')}
            name="passwordConfirm"
            dependencies={['password']}
            rules={[
              { required: true, message: t('messages.passwordConfirmIsRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error(t('messages.passwordConfirmError')));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder={t('common.passwordConfirm')} />
          </Form.Item>
        </Form>
      </Box>
    </Drawer>
  );
};
