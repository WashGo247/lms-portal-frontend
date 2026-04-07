import React from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Typography } from 'antd';

import { useTheme } from '@shared/theme/useTheme';

export const FeatureFlagKeyNamingGuidelines: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const items = [
    t('featureFlag.keyNaming.dotNotation'),
    t('featureFlag.keyNaming.example1'),
    t('featureFlag.keyNaming.example2'),
    t('featureFlag.keyNaming.lowercase'),
    t('featureFlag.keyNaming.nouns'),
    t('featureFlag.keyNaming.noEnv'),
    t('featureFlag.keyNaming.versioning'),
  ];

  return (
    <Alert
      type="info"
      showIcon
      message={t('featureFlag.keyNaming.title')}
      description={
        <ul
          style={{
            margin: `${theme.custom.spacing.xsmall}px 0 0`,
            paddingLeft: theme.custom.spacing.large,
            marginBottom: 0,
          }}
        >
          {items.map(text => (
            <li key={text}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: theme.custom.fontSize.xsmall }}
              >
                {text}
              </Typography.Text>
            </li>
          ))}
        </ul>
      }
      style={{
        marginTop: theme.custom.spacing.xsmall,
        background: theme.custom.colors.info.light,
        borderColor: theme.custom.colors.info[200],
      }}
    />
  );
};
