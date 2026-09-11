"use client";

import { Box, Grid } from '@mui/material';
import {
  WarningAmberOutlined,
  InfoOutlined,
  VisibilityOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import StatCard, { StatCardTone } from '../DashboardKpiCardMain/StatCard';
import { MuiIcon, DASHBOARD_COLORS } from '@/app/config/dashboardTheme';
import { useAlerts } from '@/Providers/AlertsProvider';
import { getAlertStats } from '@/app/(protectedRoutes)/alertsPage/AlertsMockData';

export default function AlertStatsCards() {
  const { alerts } = useAlerts();
  const alertStats = getAlertStats(alerts);

  const stats: {
    id: string;
    label: string;
    value: string | number;
    icon: MuiIcon;
    tone: StatCardTone;
  }[] = [
    { id: 'critical', label: 'Critical', value: alertStats.critical, icon: WarningAmberOutlined, tone: 'red' },
    { id: 'nonCritical', label: 'Non-Critical', value: alertStats.nonCritical, icon: InfoOutlined, tone: 'gray' },
    { id: 'acknowledged', label: 'Acknowledged', value: alertStats.acknowledged, icon: VisibilityOutlined, tone: 'amber' },
    { id: 'resolved', label: 'Resolved', value: alertStats.resolved, icon: CheckCircleOutlined, tone: 'green' },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={stat.id}>
          <StatCard
            icon={stat.icon}
            tone={stat.tone}
            value={stat.value}
            label={stat.label}
          />
        </Grid>
      ))}

      {/* Empty grey card – replaces Avg Response */}
     <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "11px",
      padding: "14px",
      border: `1.5px solid ${DASHBOARD_COLORS.border}`,
     // borderRadius: "10px",
      backgroundColor: "#F0F2F5",
                  borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",

      cursor: "default",
      height: "100%", // take full height of grid item
    }}
  >
    {/* No content – completely empty */}
  </Box>
</Grid>
    </Grid>
  );
}
