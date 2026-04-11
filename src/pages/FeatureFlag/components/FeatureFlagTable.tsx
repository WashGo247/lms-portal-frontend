import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Dropdown, Flex, Input, Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { MenuDots, TrashBinTrash, PenNewSquare } from '@solar-icons/react';

import { useTheme } from '@shared/theme/useTheme';
import type { FeatureFlag } from '@shared/types/featureFlag';

import { BaseDetailSection } from '@shared/components/BaseDetailSection';

import { FeatureFlagEnabledToggle } from './FeatureFlagEnabledToggle';

interface Props {
  flags: FeatureFlag[];
  loading: boolean;
  onAdd: () => void;
  onRefresh: () => void;
  onEdit: (flag: FeatureFlag) => void;
  onDelete: (key: string) => void;
}

export const FeatureFlagTable: React.FC<Props> = ({
  flags,
  loading,
  onAdd,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const filtered = flags.filter((f) => {
    const q = search.toLowerCase();
    return f.key.toLowerCase().includes(q) || f.displayName.toLowerCase().includes(q);
  });

  const handleDelete = (flag: FeatureFlag) => {
    Modal.confirm({
      title: t('featureFlag.deleteConfirmTitle'),
      content: t('featureFlag.deleteConfirmContent', { key: flag.key }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: () => onDelete(flag.key),
    });
  };

  const columns: ColumnsType<FeatureFlag> = [
    {
      title: t('featureFlag.columns.name'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: 240,
      sorter: (a, b) => a.displayName.localeCompare(b.displayName),
      render: (name: string, record) => (
        <Typography.Link onClick={() => onEdit(record)}>{name}</Typography.Link>
      ),
    },
    {
      title: t('featureFlag.columns.key'),
      dataIndex: 'key',
      key: 'key',
      width: 240,
      render: (key: string) => (
        <Typography.Text code style={{ fontSize: theme.custom.fontSize.small }}>
          {key}
        </Typography.Text>
      ),
    },
    {
      title: t('featureFlag.columns.scope'),
      key: 'scope',
      width: 240,
      render: (_, record) => (
        <Flex gap={4} align="center">
          <Tag>{t(`featureFlag.scope.${record.scopeType}`)}</Tag>
          {record.scopeType !== 'all' && record.scopeIds.length > 0 && (
            <Typography.Text type="secondary" style={{ fontSize: theme.custom.fontSize.small }}>
              ({record.scopeIds.length})
            </Typography.Text>
          )}
        </Flex>
      ),
    },
    {
      title: t('featureFlag.columns.description'),
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (desc: string) => {
        const text = desc?.trim() ? desc : '—';
        return (
          <Typography.Paragraph
            type="secondary"
            style={{ maxWidth: 300, marginBottom: 0 }}
            ellipsis={{
              rows: 3,
              tooltip: desc?.trim() ? { title: desc.trim() } : undefined,
            }}
          >
            {text}
          </Typography.Paragraph>
        );
      },
    },
    {
      title: t('featureFlag.columns.enabled'),
      key: 'enabled',
      width: 100,
      render: (_, record) => <FeatureFlagEnabledToggle flag={record} />,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                label: t('common.edit'),
                icon: <PenNewSquare size={14} />,
                onClick: () => onEdit(record),
              },
              {
                key: 'delete',
                label: t('common.delete'),
                icon: <TrashBinTrash size={14} />,
                style: { color: theme.custom.colors.danger.default },
                onClick: () => handleDelete(record),
              },
            ],
          }}
        >
          <Button type="text" icon={<MenuDots weight="Bold" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <BaseDetailSection
      title={t('featureFlag.pageTitle')}
      onRefresh={onRefresh}
    >
      <Flex
        justify="space-between"
        align="center"
        gap={theme.custom.spacing.medium}
        style={{ width: '100%' }}
      >
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          prefix={<SearchOutlined />}
          style={{
            width: '100%',
            maxWidth: 312,
            backgroundColor: theme.custom.colors.background.light,
            color: theme.custom.colors.neutral.default,
          }}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{
            backgroundColor: theme.custom.colors.background.light,
            color: theme.custom.colors.neutral.default,
          }}
        >
          {t('common.add')}
        </Button>
      </Flex>

      <Table<FeatureFlag>
        bordered
        rowKey="key"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          style: { color: theme.custom.colors.text.tertiary },
        }}
        onRow={() => ({
          style: { backgroundColor: theme.custom.colors.background.light },
        })}
        style={{
          width: '100%',
          overflowX: 'auto',
          backgroundColor: theme.custom.colors.background.light,
          color: theme.custom.colors.neutral.default,
        }}
      />
    </BaseDetailSection>
  );
};
