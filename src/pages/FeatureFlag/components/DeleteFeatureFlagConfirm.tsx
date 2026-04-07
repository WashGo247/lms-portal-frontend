import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Popconfirm } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';

interface Props {
  flagKey: string;
  loading?: boolean;
  onConfirm: () => void;
}

export const DeleteFeatureFlagConfirm: React.FC<Props> = ({ flagKey, loading, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Popconfirm
      title={t('featureFlag.deleteConfirm', { key: flagKey })}
      onConfirm={onConfirm}
      okText={t('common.delete')}
      cancelText={t('common.cancel')}
      okButtonProps={{ danger: true }}
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        loading={loading}
        size="small"
      />
    </Popconfirm>
  );
};
