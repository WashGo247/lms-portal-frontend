import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Dropdown, Flex, Input, List, Typography, notification } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AltArrowDown } from '@solar-icons/react';

import { useTheme } from '@shared/theme/useTheme';
import { useCan } from '@shared/hooks/useCan';
import { BaseDetailSection } from '@shared/components/BaseDetailSection';
import { PortalLayoutV2 } from '@shared/components/layouts/PortalLayoutV2';
import { useListCustomerProfilesApi } from '@shared/hooks/customer/useListCustomerProfilesApi';
import type { CustomerProfile, ListCustomerProfilesParams, ListCustomerProfilesResponse } from '@shared/types/customerProfile';

import { EditCustomerDrawer } from './components/EditCustomerDrawer';
import { ResetPasswordDrawer } from './components/ResetPasswordDrawer';

const DrawerType = {
  EDIT: 'edit',
  RESET_PASSWORD: 'reset_password',
} as const;
type DrawerType = typeof DrawerType[keyof typeof DrawerType];

export const MobileView: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const can = useCan();
  const [api, contextHolder] = notification.useNotification();

  const [filters, setFilters] = useState<ListCustomerProfilesParams>({
    page: 1,
    page_size: 10,
    search: '',
    order_by: 'created_at',
    order_direction: 'desc',
  });
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDrawerType, setSelectedDrawerType] = useState<DrawerType | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const { data: listData, loading, error: listError, listCustomerProfiles } =
    useListCustomerProfilesApi<ListCustomerProfilesResponse>();

  const fetchList = () => {
    listCustomerProfiles(filters);
  };

  const getActionItems = (record: CustomerProfile) => {
    const items = [
      {
        key: 'edit',
        label: t('common.edit'),
        visible: can('customer_profile.update'),
        onClick: () => {
          setSelectedProfileId(record.id);
          setSelectedDrawerType(DrawerType.EDIT);
          setIsDrawerOpen(true);
        },
      },
      {
        key: 'reset_password',
        label: t('common.resetPassword'),
        visible: can('customer_profile.update'),
        onClick: () => {
          setSelectedProfileId(record.id);
          setSelectedDrawerType(DrawerType.RESET_PASSWORD);
          setIsDrawerOpen(true);
        },
      },
    ];
    return items.filter(item => item.visible);
  };

  useEffect(() => {
    fetchList();
  }, [filters]);

  useEffect(() => {
    if (!isDrawerOpen) fetchList();
  }, [isDrawerOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (listError) api.error({ message: t('messages.listError') });
  }, [listError]);

  return (
    <PortalLayoutV2 title={t('navigation.customers')}>
      {contextHolder}
      <BaseDetailSection>
        <Input
          placeholder={t('common.search')}
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{
            width: '100%',
            backgroundColor: theme.custom.colors.background.light,
            color: theme.custom.colors.neutral.default,
          }}
        />

        <List
          dataSource={listData?.data ?? []}
          loading={loading}
          style={{ width: '100%' }}
          pagination={{
            current: filters.page,
            pageSize: filters.page_size,
            total: listData?.total,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            style: { color: theme.custom.colors.text.tertiary },
            onChange: (page, pageSize) => setFilters(prev => ({ ...prev, page, page_size: pageSize })),
          }}
          renderItem={(item: CustomerProfile) => (
            <List.Item
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: theme.custom.spacing.small,
                padding: theme.custom.spacing.medium,
                marginBottom: theme.custom.spacing.medium,
                backgroundColor: theme.custom.colors.background.light,
                borderRadius: theme.custom.radius.medium,
                border: `1px solid ${theme.custom.colors.neutral[200]}`,
              }}
            >
              <Flex vertical gap={theme.custom.spacing.xsmall} style={{ width: '100%' }}>
                <Flex justify="space-between" style={{ width: '100%' }}>
                  <Typography.Text strong>{item.full_name ?? '—'}</Typography.Text>
                  <Typography.Text type="secondary">{item.phone_number ?? '—'}</Typography.Text>
                </Flex>
                <Typography.Text type="secondary">{item.email ?? '—'}</Typography.Text>
              </Flex>

              <Flex justify="flex-end" style={{ width: '100%' }}>
                <Dropdown menu={{ items: getActionItems(item) }} trigger={['click']}>
                  <Button
                    icon={<AltArrowDown size={18} />}
                    style={{
                      backgroundColor: theme.custom.colors.background.light,
                      color: theme.custom.colors.neutral.default,
                    }}
                  />
                </Dropdown>
              </Flex>
            </List.Item>
          )}
        />

        {selectedDrawerType === DrawerType.EDIT && selectedProfileId && (
          <EditCustomerDrawer
            profileId={selectedProfileId}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSuccess={fetchList}
          />
        )}

        {selectedDrawerType === DrawerType.RESET_PASSWORD && selectedProfileId && (
          <ResetPasswordDrawer
            profileId={selectedProfileId}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSuccess={fetchList}
          />
        )}
      </BaseDetailSection>
    </PortalLayoutV2>
  );
};
