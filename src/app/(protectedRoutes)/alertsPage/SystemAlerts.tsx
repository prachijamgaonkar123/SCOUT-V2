'use client';

import { Grid, Container, Box } from '@mui/material';

import AlertStatsCards from '@/app/components/molecules/AlertStatsCard/AlertStatsCard';
import LiveAlerts from '@/app/components/molecules/LiveAlerts/LiveAlerts';
import TopCameras from '@/app/components/molecules/AlertTopCamera/AlertTopCamera';
import AlertsTable from '@/app/components/molecules/AlertsTable/AlertsTable';
import CollapsibleTimeFilter from '@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter';
import AlertDistribution from '@/app/components/molecules/AlertDitributionCard/AlertDistribution';
import { useAlerts } from '@/Providers/AlertsProvider';

export default function AlertsPage() {
  // Alert data + the popup itself now live in AlertsProvider (mounted in
  // ClientLayout) so the popup can render on any page — this page just
  // reads/writes the shared state.
  const { alerts, handleStatusChange } = useAlerts();

  return (
    <Container maxWidth="xl" >
      {/* Stats strip + TimeFilter share one row — no dedicated filter row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <AlertStatsCards />
        </Box>
        {/* Top-aligned with the stat-card row */}
        <Box sx={{ flexShrink: 0 }}>
          <CollapsibleTimeFilter
            // onRangeChange={handleTimeRangeChange}
            // shifts={orgShifts || []}
          />
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 2, alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <LiveAlerts />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AlertDistribution />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TopCameras />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2.5 }}>
        <AlertsTable alerts={alerts} onStatusChange={handleStatusChange} />
      </Box>
    </Container>
  );
}
