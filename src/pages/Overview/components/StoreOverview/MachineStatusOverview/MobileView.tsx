import React from 'react';
import { useTranslation } from 'react-i18next';

import { Empty, Flex, Skeleton } from 'antd';

import { useTheme } from '@shared/theme/useTheme';

import type { Machine } from '@shared/types/machine';
import type { MachineStatusDatapoint } from '@shared/hooks/dashboard/useGetMachineStatusLineChartApi';

import { BaseDetailSection } from '@shared/components/BaseDetailSection';

import { MachineStatusChart } from './MachineStatusChart';

interface Props {
  machines: Machine[];
  loading: boolean;
  chartDataByLabel: Record<string, MachineStatusDatapoint[]>;
  chartLoading: boolean;
  onRefresh: () => void;
}

export const MobileView: React.FC<Props> = ({ machines, loading, chartDataByLabel, chartLoading, onRefresh }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const renderContent = () => {
    if (loading) {
      return (
        <Flex vertical gap={theme.custom.spacing.medium} style={{ width: '100%' }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} active paragraph={{ rows: 3 }} />
          ))}
        </Flex>
      );
    }

    if (machines.length === 0) {
      return <Empty description={t('common.noData')} />;
    }

    return (
      <Flex vertical gap={theme.custom.spacing.medium} style={{ width: '100%' }}>
        {machines.map((machine) => {
          const machineName = machine.name || `Machine ${machine.relay_no}`;
          return (
            <MachineStatusChart
              key={machine.id}
              machine={machine}
              data={chartDataByLabel[machineName] ?? []}
              loading={chartLoading}
            />
          );
        })}
      </Flex>
    );
  };

  return (
    <BaseDetailSection title={t('overviewV2.machineStatus')} onRefresh={onRefresh}>
      {renderContent()}
    </BaseDetailSection>
  );
};
