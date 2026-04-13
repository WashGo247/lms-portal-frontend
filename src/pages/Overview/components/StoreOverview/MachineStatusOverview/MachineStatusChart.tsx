import React, { useMemo } from 'react';

import { Flex, Spin, Typography } from 'antd';
import { Line } from '@ant-design/plots';

import { useTheme } from '@shared/theme/useTheme';
import type { MachineStatusDatapoint } from '@shared/hooks/dashboard/useGetMachineStatusLineChartApi';
import type { Machine } from '@shared/types/machine';

import dayjs from '@shared/utils/dayjs';

const STATUS_TO_VALUE: Record<string, number> = {
  UNKNOWN: 0,
  IDLE: 1,
  BUSY: 2,
};

const STATUS_LABELS: Record<number, string> = {
  0: 'Unknown',
  1: 'Idle',
  2: 'Busy',
};

interface Props {
  machine: Machine;
  data: MachineStatusDatapoint[];
  loading: boolean;
}

export const MachineStatusChart: React.FC<Props> = ({ machine, data, loading }) => {
  const theme = useTheme();

  const chartData = useMemo(() => data.map((d) => ({
    date: d.date,
    value: STATUS_TO_VALUE[d.value] ?? 0,
    status: d.value,
  })), [data]);

  const machineName = machine.name ? machine.name : `Machine ${machine.relay_no}`;

  return (
    <Flex
      vertical
      gap={theme.custom.spacing.small}
      style={{
        width: '100%',
        border: `1px solid ${theme.custom.colors.neutral[200]}`,
        borderRadius: theme.custom.radius.medium,
        padding: theme.custom.spacing.medium,
        backgroundColor: theme.custom.colors.background.light,
      }}
    >
      <Typography.Text strong style={{ fontSize: theme.custom.fontSize.medium }}>
        {machineName}
      </Typography.Text>

      {loading ? (
        <Flex justify="center" align="center" style={{ height: 160 }}>
          <Spin />
        </Flex>
      ) : (
        <Line
          key={`machine-chart-${machine.id}`}
          data={chartData}
          xField="date"
          yField="value"
          colorField="status"
          smooth={false}
          height={160}
          lineStyle={{ lineWidth: 3 }}
          scale={{
            y: {
              domain: [0, 2],
              tickMethod: () => [0, 1, 2],
            },
            color: {
              domain: ['UNKNOWN', 'IDLE', 'BUSY'],
              range: [
                theme.custom.colors.danger.default,
                theme.custom.colors.success.default,
                theme.custom.colors.warning.default,
              ],
            },
          }}
          axis={{
            y: {
              labelFormatter: (v: number) => STATUS_LABELS[v],
            },
            x: {
              labelFormatter: (v: string) => dayjs(v).format('HH:mm'),
            },
          }}
          tooltip={{
            formatter: (datum: { date: string; value: number }) => ({
              name: machineName,
              value: STATUS_LABELS[datum.value] ?? datum.value,
            }),
          }}
        />
      )}
    </Flex>
  );
};
