"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { LocalShipping, Timeline } from "@mui/icons-material";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getOnehalftBefore, getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const VehicleUnloadingLoading: React.FC = () => {
  interface VehicleLoadingEvent {
    incident: string;
    trackId: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;

    [key: string]: string | number | boolean;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<VehicleLoadingEvent | null>(null);
  const backendData = [
    {
      id: 301,
      trackId: "TRK-001",
      loadingState: "Start",
      snapshot: "/img/vehicle-loading-unloading-monitoring/v2.jpg",
      zone: "Loading Bay A",
      camera: "CAM-21",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 08:20",
    },
    {
      id: 302,
      trackId: "TRK-002",
      loadingState: "Stop",
      snapshot: "/img/vehicle-loading-unloading-monitoring/v2.jpg",
      zone: "Loading Bay A",
      camera: "CAM-22",
      alarmTriggered: false,
      createdAt: getOnehalftBefore().fullDate,
      updatedAt: "2025-10-09 09:35",
    },
    {
      id: 304,
      trackId: "TRK-004",
      loadingState: "Start",
      snapshot: "/img/vehicle-loading-unloading-monitoring/v1.webp",
      zone: "Unloading Bay B",
      camera: "CAM-24",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 11:05",
    },
    {
      id: 304,
      trackId: "TRK-004",
      loadingState: "Stop",
      snapshot: "/img/vehicle-loading-unloading-monitoring/v1.webp",
      zone: "Unloading Bay B",
      camera: "CAM-24",
      alarmTriggered: false,
      createdAt: getOnehalftBefore().fullDate,
      updatedAt: "2025-10-09 11:05",
    },
  ];

  const recentLoadingEvents = backendData.map((item) => {
    const incident =
      item.loadingState === "Start" ? "Loading started" : "Loading stopped";

    return {
      incident,
      trackId: item.trackId,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
    };
  });

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from backendData so the totals always match the recent events
  // list and the report table.
  const zoneTotals = backendData.reduce((acc, item) => {
    if (!acc[item.zone]) {
      acc[item.zone] = { zone: item.zone, start: 0, stop: 0 };
    }
    if (item.loadingState === "Start") acc[item.zone].start += 1;
    if (item.loadingState === "Stop") acc[item.zone].stop += 1;
    return acc;
  }, {} as Record<string, { zone: string; start: number; stop: number }>);

  const zoneLoadingData = Object.values(zoneTotals).map(
    ({ zone, start, stop }) => ({
      zone,
      incident: Math.min(start, stop),
      subViolations: [
        { label: "Start", value: start, icon: PlayCircleIcon },
        { label: "Stop", value: stop, icon: StopCircleIcon },
      ],
    }),
  );

  const busiestZones = Object.keys(zoneTotals);
  const totalEvents = zoneLoadingData.reduce(
    (sum, z) => sum + z.incident,
    0,
  );

  const VehicleUnloadingLoadingKpiData = [
    {
      title: "Total Loading/Unloading Event",
      value: String(totalEvents),
      icon: LocalShipping,
      tooltipMessage: "Total loading/unloading events recorded.",
    },
    {
      title: "Average Loading/Unloading Time",
      value: "30 mins",
      icon: AccessTimeIcon,
      tooltipMessage:
        "Shows the Average Time for Vehical Loading/Unloading event",
    },

    {
      title: "Busiest Zone",
      value: busiestZones.join(", "),
      icon: Timeline,
      tooltipMessage: "Zone with the highest operation activity.",
    },
  ];

  interface FilterParams {
    status?: string;
    employeeName?: string;
    startDate?: string;
    endDate?: string;
  }
  const handleSubmitFilter = async (filters: FilterParams) => {
    console.log("Selected Filters:", filters);
    // Example: { status: "Active", employeeName: "John", startDate: "2025-09-01", endDate: "2025-09-05" }
  };

  const handleReset = () => {
    console.log("reset button clickedd");
  };

  const handleExport = (format: "csv" | "pdf") => {
    console.log("Export requested clikcedd:", format);
  };

  const handleDownloadSingle = () => {
    console.log("download single row");
  };
  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    const violation = row as VehicleLoadingEvent;
    setViewPopupData(violation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = VehicleUnloadingLoadingKpiData.map(
    (kpi) => ({
      icon: kpi.icon,
      value: kpi.value,
      label: kpi.title,
      tone: /zone|time|incidence/i.test(kpi.title) ? "info" : "red",
    }),
  );

  // TODO: replace with a real 7-day trend endpoint once one exists on this page's API.
  // Placeholder mirrors the approved mockup (src/app/.html) until that's wired up.
  const violationsTrendData = (() => {
    const values = [3, 4, 2, 5, 4, 3, 5];
    const now = new Date();
    return values.map((value, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (values.length - 1 - idx));
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value,
      };
    });
  })();

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
            mb: "20px",
          }}
        >
          <Box
            sx={{
              flex: "1 1 480px",
              minWidth: 0,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              minHeight: { xs: "auto", md: "220px" },
              border: `1px solid ${DASHBOARD_COLORS.border}`,
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ flex: "1 1 0", minWidth: 0, p: "24px" }}>
              <ViolationBreakdown metrics={breakdownMetrics} />
            </Box>
            <Box
              sx={{
                flex: "1.3 1 0",
                minWidth: 0,
                p: "24px",
                borderLeft: { xs: "none", md: `1px solid ${DASHBOARD_COLORS.border}` },
                borderTop: { xs: `1px solid ${DASHBOARD_COLORS.border}`, md: "none" },
              }}
            >
              <ViolationsTrend data={violationsTrendData} trendPercentage={18} />
            </Box>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <CollapsibleTimeFilter
              onRangeChange={() => console.log("on range changed")}
            />
          </Box>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Recent  Violations */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Incident"
              violations={recentLoadingEvents}
              loading={false}
              tooltipMessage="Latest 20 Vehicle unloading and loading events with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Zone Incident"
              violationsZone={zoneLoadingData}
              loading={false}
              tooltipMessage="Shows vehicle unloading and loading events per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        totalCount={recentLoadingEvents.length}
        page={0}
        rowsPerPage={10}
        title="Detailed Report"
        tooltipMessage="Detailed vehicle loading/unloading events report with filter, reset, and export options."
        columns={[
          { id: "incident", label: "incident" },
          { id: "time", label: "Time" },
          { id: "zone", label: "Zone" },
          { id: "cameraId", label: "Camera" },
          { id: "alarmTriggered", label: "Alarm Triggered" },
        ]}
        data={recentLoadingEvents}
        filters={[
          {
            id: "incident",
            label: "Incident",
            type: "select",
            options: Array.from(
              new Set(recentLoadingEvents.map((v) => v.incident)),
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentLoadingEvents.map((v) => v.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Camera",
            type: "select",
            options: Array.from(
              new Set(recentLoadingEvents.map((v) => v.cameraId)),
            ),
          },
          {
            id: "alarmTriggered",
            label: "Alarm Triggered",
            type: "select",
            options: ["True", "False"],
          },
          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        downloadFileName="vehicle-loading-unloading-report"
        loading={false}
      />
      {/* View Alert Popup */}

      <ViewAlertPopup
        open={viewPopupOpen}
        handleClose={() => setViewPopupOpen(false)}
        details={viewPopupData}
        imageKey="imageUrl"
        onDownload={(url) => console.log("Download:", url)}
      />
    </Box>
  );
};

export default VehicleUnloadingLoading;
