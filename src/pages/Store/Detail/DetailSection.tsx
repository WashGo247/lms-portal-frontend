import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@shared/theme/useTheme';
import { useCan } from '@shared/hooks/useCan';

import { type Store } from '@shared/types/store';

import { DataWrapper } from '@shared/components/DataWrapper';
import { DynamicTag } from '@shared/components/DynamicTag';
import { BaseDetailSection } from '@shared/components/BaseDetailSection';


interface Props {
  store: Store;
}

export const DetailSection: React.FC<Props> = ({ store }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const can = useCan();

  return (
    <BaseDetailSection title={t('common.basicInformation')} onEdit={can('store.update') ? () => navigate(`/stores/${store.id}/edit`) : undefined}>
      <DataWrapper title={t('common.name')} value={store.name || '-'} />
      <DataWrapper title={t('common.status')} >
        <DynamicTag value={store.status} type="text" />
      </DataWrapper>
      <DataWrapper title={t('common.address')} value={store.address || '-'} />
      <DataWrapper title={t('common.contactPhoneNumber')} value={store.contact_phone_number || '-'} />
      <DataWrapper title={t('common.logo')}>
        {store.logo_url ? (
          <img
            src={store.logo_url}
            alt="Store logo"
            style={{ width: 128, height: 128, objectFit: 'contain', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
      </DataWrapper>
    </BaseDetailSection>
  );
};
