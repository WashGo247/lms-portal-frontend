import React from 'react';
import { useTranslation } from 'react-i18next';

import { Col, Empty, Row, Skeleton } from 'antd';

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

export const DesktopView: React.FC<Props> = ({ machines, loading, chartDataByLabel, chartLoading, onRefresh }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const renderContent = () => {
    if (loading) {
      return (
        <Row gutter={[theme.custom.spacing.medium, theme.custom.spacing.medium]} style={{ width: '100%' }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Col key={index} span={12}>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Col>
          ))}
        </Row>
      );
    }

    if (machines.length === 0) {
      return <Empty description={t('common.noData')} />;
    }

    return (
      <Row gutter={[theme.custom.spacing.medium, theme.custom.spacing.medium]} style={{ width: '100%' }}>
        {machines.map((machine) => {
          const machineName = machine.name || `Machine ${machine.relay_no}`;
          return (
            <Col key={machine.id} span={12}>
              <MachineStatusChart
                machine={machine}
                data={chartDataByLabel[machineName] ?? []}
                loading={chartLoading}
              />
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <BaseDetailSection title={t('overviewV2.machineStatus')} onRefresh={onRefresh}>
      {renderContent()}
    </BaseDetailSection>
  );
};
