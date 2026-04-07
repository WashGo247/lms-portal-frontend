import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { notification } from 'antd';

import { PortalLayoutV2 } from '@shared/components/layouts/PortalLayoutV2';
import { FeatureFlagDrawer } from '@pages/FeatureFlag/components/FeatureFlagDrawer';
import { FeatureFlagTable } from '@pages/FeatureFlag/components/FeatureFlagTable';
import { useCreateFeatureFlag } from '@shared/hooks/useCreateFeatureFlag';
import { useDeleteFeatureFlag } from '@shared/hooks/useDeleteFeatureFlag';
import { useGetFeatureFlags } from '@shared/hooks/useGetFeatureFlags';
import { useUpdateFeatureFlag } from '@shared/hooks/useUpdateFeatureFlag';
import type {
  CreateFeatureFlagParams,
  FeatureFlag,
  UpdateFeatureFlagParams,
} from '@shared/types/featureFlag';

export const FeatureFlagPage: React.FC = () => {
  const { t } = useTranslation();
  const [api, contextHolder] = notification.useNotification();

  const { data: flags, loading: listLoading, fetch } = useGetFeatureFlags();
  const { loading: createLoading, create } = useCreateFeatureFlag();
  const { loading: updateLoading, update } = useUpdateFeatureFlag();
  const { remove } = useDeleteFeatureFlag();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    fetch().catch(() => {
      api.error({ message: t('featureFlag.fetchError') });
    });
  }, [fetch, api, t]);

  const openCreate = () => {
    setDrawerMode('create');
    setEditingFlag(null);
    setDrawerOpen(true);
  };

  const openEdit = (flag: FeatureFlag) => {
    setDrawerMode('edit');
    setEditingFlag(flag);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSave = async (data: CreateFeatureFlagParams | UpdateFeatureFlagParams) => {
    try {
      if (drawerMode === 'create') {
        await create(data as CreateFeatureFlagParams);
        api.success({ message: t('featureFlag.createSuccess') });
      } else {
        await update(editingFlag!.key, data as UpdateFeatureFlagParams);
        api.success({ message: t('featureFlag.updateSuccess') });
      }
      closeDrawer();
      fetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.error');
      api.error({ message });
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await remove(key);
      api.success({ message: t('featureFlag.deleteSuccess') });
      fetch();
    } catch {
      api.error({ message: t('featureFlag.deleteError') });
    }
  };

  return (
    <PortalLayoutV2 title={t('featureFlag.pageTitle')}>
      {contextHolder}

      <FeatureFlagTable
        flags={flags ?? []}
        loading={listLoading}
        onAdd={openCreate}
        onRefresh={fetch}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <FeatureFlagDrawer
        open={drawerOpen}
        mode={drawerMode}
        flag={editingFlag ?? undefined}
        loading={drawerMode === 'create' ? createLoading : updateLoading}
        onSave={handleSave}
        onClose={closeDrawer}
      />
    </PortalLayoutV2>
  );
};
