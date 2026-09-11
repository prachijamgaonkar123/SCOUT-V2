"use client";

import { Card, Box, Typography } from '@mui/material';
import {
  LocalShippingOutlined,
  SensorsOutlined,
  WarningAmberOutlined,
  GroupsOutlined,
} from '@mui/icons-material';
import { useAlerts } from '@/Providers/AlertsProvider';
import { getLiveAlerts } from '@/app/(protectedRoutes)/alertsPage/AlertsMockData';
import type { UseCaseCategory } from '@/app/config/dashboardTheme';

// Icon shown per alert category — kept independent of the specific title so
// it doesn't need updating every time the mock data's titles change.
const CATEGORY_ICON: Record<UseCaseCategory, typeof WarningAmberOutlined> = {
  safety: WarningAmberOutlined,
  surveillance: SensorsOutlined,
  operational: LocalShippingOutlined,
  workforce: GroupsOutlined,
};

export default function LiveAlerts() {
  const { alerts: allAlerts } = useAlerts();
  const alerts = getLiveAlerts(allAlerts, 4);

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 24px 4px 24px',
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            color: '#111827',
          }}
        >
          Live Alerts
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#16A34A',
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16A34A' }} />
          Live
        </Box>
      </Box>

      {/* Feed */}
      <Box
        sx={{
          p: '6px 20px 18px 20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {alerts.map((alert, idx) => {
          const Icon = CATEGORY_ICON[alert.category];
          return (
          <Box
            key={alert.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              py: '10px',
              borderBottom: idx < alerts.length - 1 ? '1px solid #E5E7EB' : 'none',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: alert.severity === 'critical' ? '#FDECEC' : '#F1F2F4',
                color: alert.severity === 'critical' ? '#DC2626' : '#64748B',
              }}
            >
              <Icon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#111827' }}>
                {alert.title}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#6B7280', mt: '2px' }}>
                {alert.camera} · {alert.zone}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, flexShrink: 0 }}>
              {alert.time}
            </Typography>
          </Box>
          );
        })}
      </Box>
    </Card>
  );
}
