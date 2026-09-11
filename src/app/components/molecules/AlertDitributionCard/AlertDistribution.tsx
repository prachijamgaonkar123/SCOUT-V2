"use client";

import { Card, Box, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAlerts } from '@/Providers/AlertsProvider';
import { getAlertStats } from '@/app/(protectedRoutes)/alertsPage/AlertsMockData';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  cutout: '68%',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#111827', padding: 10, cornerRadius: 8 },
  },
};

export default function AlertDistribution() {
  const { alerts } = useAlerts();
  const alertStats = getAlertStats(alerts);

  const legendItems = [
    { label: 'Critical', value: alertStats.critical, color: '#DC2626' },
    { label: 'Non-Critical', value: alertStats.nonCritical, color: '#64748B' },
  ];

  const total = alertStats.critical + alertStats.nonCritical;

  const data = {
    labels: legendItems.map((item) => item.label),
    datasets: [
      {
        data: legendItems.map((item) => item.value),
        backgroundColor: legendItems.map((item) => item.color),
        borderWidth: 3,
        borderColor: '#fff',
      },
    ],
  };

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: '20px 24px 2px 24px' }}>
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            color: '#111827',
          }}
        >
          Alert Distribution
        </Typography>
        <Typography sx={{ fontSize: '11.5px', color: '#6B7280', mt: '4px' }}>
          Breakdown of active alerts by severity level
        </Typography>
      </Box>

      {/* Donut + legend */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          p: '6px 20px 18px 20px',
          flex: 1,
        }}
      >
        <Box sx={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
          <Doughnut data={data} options={options} />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              {total}
            </Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#6B7280' }}>
              Total Alerts
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {legendItems.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: item.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#111827', flex: 1 }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#111827' }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
