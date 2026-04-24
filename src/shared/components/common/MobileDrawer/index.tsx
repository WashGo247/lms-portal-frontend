import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  Drawer,
  Menu,
  Typography,
  Button,
  Flex,
  type MenuProps,
} from 'antd';

import Flag from 'react-world-flags';

import {
  Widget,
  Logout,
  Shop2,
  BoxMinimalistic,
  Suitcase,
  UsersGroupTwoRounded,
  Home,
  User as UserIcon,
  SaleSquare,
  CheckSquare,
  Buildings2,
  Library,
  DollarMinimalistic
} from '@solar-icons/react'

import { useTheme } from '@shared/theme/useTheme';
import { usePermissionContext } from '@shared/contexts/PermissionContext';
import { useCan } from '@shared/hooks/useCan';

import { userStorage } from '@core/storage/userStorage';
import { tenantStorage } from '@core/storage/tenantStorage';
import { tokenStorage } from '@core/storage/tokenStorage';

import { type User } from '@shared/types/user';
import { UserRoleEnum } from '@shared/enums/UserRoleEnum';

import { DynamicTag } from '@shared/components/DynamicTag';

const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number] & {
  children?: MenuItem[];
};

interface MenuItemConfig {
  key?: string;
  icon?: React.ReactNode;
  label?: string;
  children?: Array<{
    key: string;
    label: string;
    permission?: string;
    visible?: boolean;
  }>;
  type?: 'divider' | 'item';
  permission?: string; // Permission required to show this menu item
  visible?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<Props> = ({ open, onClose }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const tenant = tenantStorage.load();

  const can = useCan();
  const { ready } = usePermissionContext();

  const [selectedMainKey, setSelectedMainKey] = useState<string | null>(null);
  const [selectedTenantKey, setSelectedTenantKey] = useState<string | null>(null);

  const allMenuItems: MenuItemConfig[] = React.useMemo(() => [
    {
      key: 'overview',
      icon: <Widget />,
      label: t('navigation.overview'),
    },
    {
      key: 'stores',
      icon: <Shop2 />,
      label: t('navigation.stores'),
      permission: 'store.list',
    },
    {
      key: 'controllers',
      icon: <BoxMinimalistic />,
      label: t('navigation.controllers'),
      permission: 'controller.list',
    },
    {
      key: 'orders',
      icon: <DollarMinimalistic />,
      label: t('navigation.orders'),
      permission: 'order.list',
    },
    {
      key: 'promotion-campaigns',
      icon: <SaleSquare />,
      label: t('navigation.promotionCampaign'),
      permission: 'promotion_campaign.list',
    },
    { type: 'divider' },
    {
      key: 'tenants/profile',
      icon: <Suitcase />,
      label: t('navigation.tenantProfile'),
      permission: 'tenant.get',
      visible: user?.role !== UserRoleEnum.ADMIN,
    },
    {
      key: 'tenant-members',
      icon: <UsersGroupTwoRounded />,
      label: t('navigation.tenantMembers'),
      permission: 'tenant_member.list',
      visible: user?.role !== UserRoleEnum.ADMIN,
    },
    { type: 'divider' },
    {
      key: 'customers',
      icon: <UsersGroupTwoRounded />,
      label: t('navigation.customers'),
      permission: 'customer_profile.list',
    },
    {
      key: 'tenants',
      icon: <Buildings2 />,
      label: t('navigation.tenants'),
      permission: 'tenant.list',
    },
    {
      key: 'firmware',
      icon: <Library />,
      label: t('navigation.firmware'),
      permission: 'firmware.list',
    },
    {
      key: 'permissions',
      icon: <CheckSquare />,
      label: t('navigation.permissions'),
      permission: 'permission.list',
    },
    {
      type: 'divider',
    },
    {
      key: 'user/profile',
      icon: <UserIcon />,
      label: t('navigation.userProfile'),
    },
  ], [t, user]);

  useEffect(() => {
    const loadUserData = () => {
      const userData = userStorage.load();
      setUser(userData);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;

    // Set main menu selection
    if (currentPath.startsWith('/overview')) {
      setSelectedMainKey('overview');
    } else if (currentPath.startsWith('/stores')) {
      setSelectedMainKey('stores');
    } else if (currentPath.startsWith('/controllers')) {
      setSelectedMainKey('controllers');
    } else if (currentPath.startsWith('/machines')) {
      setSelectedMainKey('machines');
    } else if (currentPath.startsWith('/orders')) {
      setSelectedMainKey('orders');
    }

    // Set tenant menu selection
    if (currentPath.startsWith('/tenants/profile')) {
      setSelectedTenantKey('tenants/profile');
    } else if (currentPath.startsWith('/tenant-members')) {
      setSelectedTenantKey('tenant-members');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    tokenStorage.clear();
    userStorage.clear();
    tenantStorage.clear();
    navigate('/auth/sign-in');
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
    onClose();
  };

  const menuItems = React.useMemo(() => {
    if (!ready) {
      // Return empty array while permissions are loading
      return [];
    }

    const filteredItems: MenuItemConfig[] = [];
    let previousWasDivider = false;

    for (let i = 0; i < allMenuItems.length; i++) {
      const item = allMenuItems[i];

      if (item.type === 'divider') {
        // Only add divider if there are visible items before and after
        const hasVisibleBefore = filteredItems.length > 0;
        const hasVisibleAfter = allMenuItems.slice(i + 1).some((nextItem) => {
          if (nextItem.type === 'divider') return false;

          // Check visible property
          const isVisible = nextItem.visible === undefined
            ? true
            : typeof nextItem.visible === 'function'
              ? (nextItem.visible as (user: any) => boolean)(user)
              : nextItem.visible;

          if (!isVisible) return false;
          if (!nextItem.permission) return true; // User profile doesn't need permission
          return can(nextItem.permission);
        });

        if (hasVisibleBefore && hasVisibleAfter && !previousWasDivider) {
          filteredItems.push({ type: 'divider' });
          previousWasDivider = true;
        } else {
          previousWasDivider = false;
        }
        continue;
      }

      // Check visible property (can be boolean or function)
      const isVisible = item.visible === undefined
        ? true
        : typeof item.visible === 'function'
          ? (item.visible as (user: any) => boolean)(user)
          : item.visible;

      if (!isVisible) {
        continue;
      }

      // Handle items with children
      if (item.children && item.children.length > 0) {
        // Filter children by their permissions and visible property
        const filteredChildren = item.children.filter((child) => {
          // Check permission
          const hasPermission = !child.permission || can(child.permission);
          if (!hasPermission) return false;

          // Check visible property
          const childVisible = child.visible === undefined
            ? true
            : typeof child.visible === 'function'
              ? (child.visible as (user: any) => boolean)(user)
              : child.visible;

          return childVisible;
        });

        // Only show parent if at least one child is visible
        if (filteredChildren.length === 0) {
          continue;
        }

        // For items with children, show parent if any child is visible
        const parentPermissionCheck = !item.permission || can(item.permission);
        if (parentPermissionCheck) {
          filteredItems.push({
            ...item,
            children: filteredChildren,
          });
          previousWasDivider = false;
        }
      } else {
        // Regular item without children - check permission
        const shouldShow = !item.permission || can(item.permission);
        if (shouldShow) {
          filteredItems.push(item);
          previousWasDivider = false;
        }
      }
    }

    while (
      filteredItems.length > 0 &&
      filteredItems[filteredItems.length - 1].type === 'divider'
    ) {
      filteredItems.pop();
    }

    return filteredItems
      .map((item) => {
        if (item.type === 'divider') {
          return { type: 'divider' as const };
        }

        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children,
        };
      }) as MenuItem[];
  }, [allMenuItems, can, ready, user]);

  return (
    <Drawer
      title={null}
      placement="left"
      closable={false}
      onClose={onClose}
      open={open}
      width="100%"
      style={{
        backgroundColor: theme.custom.colors.background.light,
      }}
      bodyStyle={{
        padding: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex
        vertical
        style={{
          height: '100%',
          width: '100%',
          padding: theme.custom.spacing.medium,
        }}
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          style={{
            marginBottom: theme.custom.spacing.large,
            paddingBottom: theme.custom.spacing.medium,
            borderBottom: `1px solid ${theme.custom.colors.neutral[200]}`,
          }}
        >
          <Flex vertical gap={theme.custom.spacing.xsmall}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.custom.colors.text.primary,
              }}
            >
              {tenant?.name || 'WashGo247'}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.custom.colors.text.secondary,
              }}
            >
              {user?.email}
            </Text>
          </Flex>

          {/* User Role Badge */}
          {user?.role && (
            <Flex
              justify="center"
              style={{
                marginBottom: theme.custom.spacing.large,
              }}
            >
              <DynamicTag value={user.role} type="text" />
            </Flex>
          )}
        </Flex>

        {/* Menu */}
        <Flex
          vertical
          style={{
            flex: 1,
            width: '100%',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedMainKey, selectedTenantKey].filter(Boolean) as string[]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: 16,
            }}
          />
        </Flex>

        {/* Language Selection */}
        <Flex
          justify="center"
          align="center"
          gap={theme.custom.spacing.medium}
          style={{
            marginTop: theme.custom.spacing.large,
            paddingTop: theme.custom.spacing.medium,
            borderTop: `1px solid ${theme.custom.colors.neutral[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.custom.colors.text.secondary,
            }}
          >
            {t('navigation.language')}:
          </Text>
          <Flex gap={theme.custom.spacing.small}>
            <Flag
              code="vn"
              style={{
                width: 48,
                height: 32,
                borderRadius: 4,
                cursor: 'pointer',
                border: i18n.language === 'vn' ? '2px solid #1677ff' : '2px solid transparent',
                objectFit: 'cover' as React.CSSProperties['objectFit'],
              }}
              onClick={() => {
                i18n.changeLanguage('vn');
              }}
            />
            <Flag
              code="gb"
              style={{
                width: 48,
                height: 32,
                borderRadius: 4,
                cursor: 'pointer',
                border: i18n.language === 'en' ? '2px solid #1677ff' : '2px solid transparent',
                objectFit: 'cover' as React.CSSProperties['objectFit'],
              }}
              onClick={() => {
                i18n.changeLanguage('en');
              }}
            />
          </Flex>
        </Flex>

        {/* Button Group */}
        <Flex
          justify="center"
          gap={theme.custom.spacing.medium}
          style={{
            marginTop: theme.custom.spacing.medium,
          }}
        >
          <Button
            type="primary"
            danger
            icon={<Logout />}
            onClick={handleLogout}
            style={{
              width: '100%',
              height: 48,
              fontSize: 16,
              color: theme.custom.colors.danger.default,
              padding: theme.custom.spacing.medium,
              borderRadius: theme.custom.radius.full,
              backgroundColor: theme.custom.colors.danger.light,
            }}
          >
            {t('navigation.logout')}
          </Button>

          <Button
            type="primary"
            icon={<Home />}
            onClick={() => {
              navigate('/overview');
              onClose();
            }}
            style={{
              width: '100%',
              height: 48,
              fontSize: 16,
              color: theme.custom.colors.text.inverted,
              padding: theme.custom.spacing.medium,
              borderRadius: theme.custom.radius.full,
            }}
          >
            {t('navigation.home')}
          </Button>
        </Flex>
      </Flex>
    </Drawer>
  );
};
