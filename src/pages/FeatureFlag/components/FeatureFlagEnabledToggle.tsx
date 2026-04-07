import React from 'react';
import { useTranslation } from 'react-i18next';

import { Switch, notification } from 'antd';

import { useUpdateFeatureFlag } from '@shared/hooks/useUpdateFeatureFlag';
import type { FeatureFlag } from '@shared/types/featureFlag';

interface Props {
  flag: FeatureFlag;
}

export const FeatureFlagEnabledToggle: React.FC<Props> = ({ flag }) => {
  const { t } = useTranslation();
  const { loading, update } = useUpdateFeatureFlag();
  const [api, contextHolder] = notification.useNotification();

  const handleToggle = async (checked: boolean) => {
    try {
      await update(flag.key, { isEnabled: checked });
    } catch {
      api.error({ message: t('featureFlag.toggleError') });
    }
  };

  return (
    <>
      {contextHolder}
      <Switch
        checked={flag.isEnabled}
        loading={loading}
        onChange={handleToggle}
      />
    </>
  );
};
