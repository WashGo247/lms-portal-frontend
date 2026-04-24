import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Dropdown, Flex, Input, Select, Table, notification } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { MenuDots } from '@solar-icons/react';
import { SearchOutlined } from '@ant-design/icons';

import { useTheme } from '@shared/theme/useTheme';
import { useCan } from '@shared/hooks/useCan';
import { GenderEnum } from '@shared/enums/GenderEnum';
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

export const DesktopView: React.FC = () => {
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

  const columns: ColumnsType<CustomerProfile> = [
    {
      title: t('common.createdAt'),
      dataIndex: 'created_at',
      sorter: true,
      sortOrder: filters.order_by === 'created_at' ? (filters.order_direction === 'asc' ? 'ascend' : 'descend') : undefined,
      render: (text: string) => new Date(text).toLocaleDateString(),
      width: 140,
    },
    {
      title: t('customer.customerCode'),
      dataIndex: 'customer_code',
      sorter: true,
      sortOrder: filters.order_by === 'customer_code' ? (filters.order_direction === 'asc' ? 'ascend' : 'descend') : undefined,
      width: 140,
    },
    {
      title: t('customer.fullName'),
      dataIndex: 'full_name',
      sorter: true,
      sortOrder: filters.order_by === 'full_name' ? (filters.order_direction === 'asc' ? 'ascend' : 'descend') : undefined,
      width: 200,
    },
    {
      title: t('common.email'),
      dataIndex: 'email',
      sorter: true,
      sortOrder: filters.order_by === 'email' ? (filters.order_direction === 'asc' ? 'ascend' : 'descend') : undefined,
      width: 220,
    },
    {
      title: t('common.phone'),
      dataIndex: 'phone_number',
      sorter: true,
      sortOrder: filters.order_by === 'phone_number' ? (filters.order_direction === 'asc' ? 'ascend' : 'descend') : undefined,
      width: 160,
    },
    {
      title: t('customer.gender'),
      dataIndex: 'gender',
      sorter: true,
      sortOrder: filters.order_by === 'gender' ? (filters.order_direction === 'asc' ? 'ascend' : 'descend') : undefined,
      width: 120,
    },
    {
      title: t('customer.address'),
      dataIndex: 'address',
      sorter: true,
      sortOrder: filters.order_by === 'address' ? (filters.order_direction === 'asc' ? 'ascend' : 'descend') : undefined,
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      width: 80,
      render: (_: unknown, record: CustomerProfile) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MenuDots />} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _tableFilters: Record<string, FilterValue | null>,
    sorter: SorterResult<CustomerProfile> | SorterResult<CustomerProfile>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setFilters(prev => ({
      ...prev,
      page: pagination.current ?? 1,
      page_size: pagination.pageSize ?? prev.page_size,
      ...(s.field ? { order_by: s.field as string, order_direction: s.order === 'ascend' ? 'asc' : 'desc' } : {}),
    }));
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
        <Flex justify="space-between" wrap gap={theme.custom.spacing.medium} style={{ width: '100%' }}>
          <Input
            placeholder={t('common.search')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{
              width: '100%',
              maxWidth: 312,
              backgroundColor: theme.custom.colors.background.light,
              color: theme.custom.colors.neutral.default,
            }}
          />
          <Select
            placeholder={t('customer.filterByGender')}
            allowClear
            style={{ width: 180 }}
            onChange={value => setFilters(prev => ({ ...prev, gender: value, page: 1 }))}
            options={[
              { label: t('customer.genderMale'), value: GenderEnum.MALE },
              { label: t('customer.genderFemale'), value: GenderEnum.FEMALE },
              { label: t('customer.genderOther'), value: GenderEnum.OTHER },
            ]}
          />
        </Flex>

        <Table
          bordered
          rowKey="id"
          dataSource={listData?.data ?? []}
          columns={columns}
          loading={loading}
          style={{ width: '100%', overflowX: 'auto' }}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.page_size,
            total: listData?.total,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            style: { color: theme.custom.colors.text.tertiary },
          }}
          onRow={() => ({ style: { backgroundColor: theme.custom.colors.background.light } })}
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
