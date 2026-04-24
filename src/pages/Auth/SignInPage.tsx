import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Typography, Form, Input, Divider, Spin, notification } from 'antd';

import { useTheme } from '@shared/theme/useTheme';

import {
  tokenManager,
  type TokenBundle,
} from '@core/auth/tokenManager';

import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from '@core/constant'

import { tenantStorage } from '@core/storage/tenantStorage';
import { userStorage } from '@core/storage/userStorage';
import { permissionStorage } from '@core/storage/permissionStorage';

import { UserRoleEnum } from '@shared/enums/UserRoleEnum';

import { useSignInApi } from '@shared/hooks/useSignInApi';
import { useGetLMSProfileApi } from '@shared/hooks/useGetLMSProfile';
import { useGetMeApi } from '@shared/hooks/useGetMe';
import { useGetMePermissionsApi } from '@shared/hooks/useGetMePermissions';
import { useProceedAuthSessionApi } from '@shared/hooks/useProceedAuthSessionApi';
import { useProcessSystemTaskApi } from '@shared/hooks/useProcessSystemTaskApi';
import { useApproveAuthSessionApi } from '@shared/hooks/useApproveAuthSessionApi';

import { AuthContainer } from './components';

export const SignInPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [autoAuthFailed, setAutoAuthFailed] = useState(false);

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') as string;
  const redirectTo = searchParams.get('redirect_to') as string;

  const hasExistingSession = sessionId
    && !autoAuthFailed
    && tokenManager.isAuthenticated()
    && !tokenManager.isAccessTokenExpired();

  const {
    signIn,
    loading: signInLoading,
    data: signInData,
    error: signInError,
  } = useSignInApi();
  const {
    getLMSProfile,
    data: getLMSProfileData,
  } = useGetLMSProfileApi();
  const {
    getMe,
    loading: getMeLoading,
    data: getMeData,
    error: getMeError,
  } = useGetMeApi();
  const {
    getMePermissions,
  } = useGetMePermissionsApi();
  const {
    proceedAuthSession,
  } = useProceedAuthSessionApi();
  const {
    processSystemTask,
  } = useProcessSystemTaskApi();
  const {
    approveAuthSession,
  } = useApproveAuthSessionApi();

  const handleSubmit = async () => {
    await signIn({
      email: form.getFieldValue('email'),
      password: form.getFieldValue('password'),
      sessionId: sessionId,
    });
  };

  const handleSuccessfulAuth = async () => {
    try {
      const bundle: TokenBundle = {
        accessToken: (signInData as any).access_token,
        refreshToken: (signInData as any).refresh_token,
        accessTokenExp: Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000,
        refreshTokenExp: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
      }
      tokenManager.setTokens(bundle)
      
      // Fetch and save permissions after successful login
      try {
        const permissionsResponse = await getMePermissions()
        permissionStorage.save(permissionsResponse.permissions)
      } catch {
        // Ignore permission fetch errors - login is still successful
      }
    } catch {
      api.error({
        message: t('messages.signInFailed'),
      });

      navigate('/verification-failed');
    }

    getMe();
  };

  const goNext = () => {
    try {
      if (redirectTo) {
        if (redirectTo.startsWith('/')) {
          navigate(redirectTo);
        } else {
          navigate(`/${redirectTo}`);
        }
      } else {
        navigate('/overview');
      }
    } catch (error) {
      console.warn('Invalid redirect_to parameter:', redirectTo);
      navigate('/overview');
    }
  }

  useEffect(() => {
    if (sessionId) {
      proceedAuthSession({ sessionId: sessionId });
      processSystemTask({ sessionId: sessionId });

      if (tokenManager.isAuthenticated() && !tokenManager.isAccessTokenExpired()) {
        approveAuthSession(sessionId)
          .then(() => getMe())
          .catch(() => setAutoAuthFailed(true));
      }
    }
  }, [sessionId]);

  useEffect(() => {
    if (signInData) {
      handleSuccessfulAuth();
    }
  }, [signInData])

  useEffect(() => {
    if (signInError) {
      api.error({
        message: t('messages.incorrectCredentials'),
      });
    }
  }, [signInError])

  useEffect(() => {
    if (getLMSProfileData) {
      userStorage.save(getLMSProfileData.user);
      tenantStorage.save(getLMSProfileData.tenant);
      goNext();
    }
  }, [getLMSProfileData]);

  useEffect(() => {
    if (getMeData) {
      userStorage.save(getMeData);
      if (getMeData.role === UserRoleEnum.ADMIN) {
        goNext();
      } else {
        getLMSProfile();
      }
    }
  }, [getMeData]);

  if (hasExistingSession) {
    return (
      <AuthContainer>
        {contextHolder}
        <Spin size="large" />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      {contextHolder}
      <Typography.Title level={2}>{t('common.signIn')}</Typography.Title>
      <Divider />
      <Form form={form}>
        <Form.Item label={t('common.email')} name="email" labelCol={{ span: 24 }}>
          <Input size="large" />
        </Form.Item>

        <Form.Item label={t('common.password')} name="password" labelCol={{ span: 24 }}>
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item labelCol={{ span: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: '100%', borderRadius: theme.custom.radius.full }}
            onClick={handleSubmit}
            loading={signInLoading}
          >
            {t('common.signIn')}
          </Button>
        </Form.Item>
      </Form>
    </AuthContainer>
  );
};
