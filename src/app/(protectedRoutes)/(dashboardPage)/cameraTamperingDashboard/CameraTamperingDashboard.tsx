"use client";
import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import {
  VideocamOutlined,
  WifiOff,
  WarningAmber,
  Domain,
  WifiTethering,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

import DashboardKpiCard, {
  DashboardKpiCardProps,
} from "@/app/components/molecules/MonitoringDashboardKpiCard/MonitoringDashboardKpiCard";
import  DashboardTabs, {
  TabConfig,
} from "@/app/components/organisms/DashboardTabs/DashboardTabs";
import DynamicBarChart from "@/app/components/organisms/BarChart/BarChart";
import CameraStatusDonutChart from "@/app/components/organisms/DonutChart/DonutChart";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
import { getOneHourBefore, getOnehalftBefore } from "@/utils/getOneHrBefore";

/* -------------------- DATA -------------------- */

// Camera trend (also drives the Total/Online/Offline KPI cards below —
// use the latest reading so the cards match what the trend chart shows)
const cameraTrendData = [
  { time: "00:00", online: 105, offline: 15 },
  { time: "06:00", online: 108, offline: 12 },
  { time: "12:00", online: 110, offline: 10 },
  { time: "18:00", online: 115, offline: 2 },
];
const latestCameraTrend = cameraTrendData[cameraTrendData.length - 1];
const totalCameras = latestCameraTrend.online + latestCameraTrend.offline;

// Tampering trend
const tamperingTrendData = [
  { time: "00:00", offline: 3, blur: 2, lensCovered: 1 },
  { time: "06:00", offline: 4, blur: 2, lensCovered: 2 },
  { time: "12:00", offline: 5, blur: 3, lensCovered: 2 },
  { time: "18:00", offline: 7, blur: 4, lensCovered: 3 },
];

// Donut
const tamperingTypeData = [
  { label: "Offline", value: 40, color: DASHBOARD_COLORS.workforce },
  { label: "Blur", value: 25, color: DASHBOARD_COLORS.warning },
  { label: "Lens Covered", value: 15, color: DASHBOARD_COLORS.accent },
  { label: "Online", value: 20, color: DASHBOARD_COLORS.success },
];

// Camera uptime / downtime (TOP 10)
const cameraUptimeDowntimeData = [
  { camera: "CAM-001", uptime: 92, downtime: 8 },
  { camera: "CAM-002", uptime: 95, downtime: 5 },
  { camera: "CAM-003", uptime: 90, downtime: 10 },
  { camera: "CAM-004", uptime: 97, downtime: 3 },
  { camera: "CAM-005", uptime: 94, downtime: 6 },
  { camera: "CAM-006", uptime: 91, downtime: 9 },
  { camera: "CAM-007", uptime: 89, downtime: 11 },
  { camera: "CAM-008", uptime: 96, downtime: 4 },
  { camera: "CAM-009", uptime: 93, downtime: 7 },
  { camera: "CAM-010", uptime: 98, downtime: 2 },
];

// Zone-wise camera counts
const cameraHealthByZone = [
  { zone: "Parking", online: 5, offline: 3, tampered: 1 },
  { zone: "Warehouse", online: 4, offline: 2, tampered: 1 },
  { zone: "Office", online: 7, offline: 0, tampered: 0 },
  { zone: "Gate 1", online: 6, offline: 1, tampered: 1 },
];

/* -------------------- KPI DATA -------------------- */
// Single source of truth: derived from cameraTrendData / cameraHealthByZone
// so the cards always agree with the charts below them.
const tamperingIncidentsToday = cameraHealthByZone.reduce(
  (sum, z) => sum + z.tampered,
  0
);
const zonesAffected = cameraHealthByZone.filter((z) => z.tampered > 0);
const topTamperedZone = [...cameraHealthByZone].sort(
  (a, b) => b.tampered - a.tampered
)[0];

// Every card needs both a location and a time (hh:mm:ss, 24-hour) — no
// placeholder "—" values and no 12-hour AM/PM strings.
const nowTime = getOneHourBefore().time; // hh:mm:ss
const earlierTime = getOnehalftBefore().time; // hh:mm:ss

const kpiData: Array<Omit<DashboardKpiCardProps, "route" | "tooltipMessage">> =
  [
    {
      title: "Total Cameras",
      violationsCount: totalCameras,
      lastDetection: "All Zones",
      lastDetectionTime: nowTime,
      icon: VideocamOutlined,
      tone: "green",
    },
    {
      title: "Cameras Online",
      violationsCount: latestCameraTrend.online,
      lastDetection: "All Zones",
      lastDetectionTime: nowTime,
      icon: WifiTethering,
      tone: "green",
    },
    {
      title: "Cameras Offline",
      violationsCount: latestCameraTrend.offline,
      lastDetection: "Parking",
      lastDetectionTime: earlierTime,
      icon: WifiOff,
      tone: "red",
    },
    {
      title: "Tampering Incidents Today",
      violationsCount: tamperingIncidentsToday,
      lastDetection: topTamperedZone.zone,
      lastDetectionTime: earlierTime,
      icon: WarningAmber,
      tone: "blue",
    },
    {
      title: "Zones Affected",
      violationsCount: zonesAffected.length,
      lastDetection: zonesAffected.map((z) => z.zone).join(", "),
      lastDetectionTime: earlierTime,
      icon: Domain,
      tone: "blue",
    },
  ];

/* -------------------- MAIN COMPONENT -------------------- */
export default function CameraTamperingDashboard() {
const tabs: TabConfig[] = [
  // -------- TAB 1: Camera Trend --------
{
  label: "Camera Trend",
  content: (
    <Grid container sx={{ height: "100%", minHeight: 0 }}>
      <Grid size={{ xs: 12 }} sx={{ display: "flex", height: "100%" }}>
        <Box sx={{ width: "100%", height: 400, maxHeight: "100%" }}>
          <DynamicBarChart
            data={cameraTrendData}
            xAxisKey="time"
            series={[
              { dataKey: "online", label: "Online", color: DASHBOARD_COLORS.success },
              { dataKey: "offline", label: "Offline", color: DASHBOARD_COLORS.workforce },
            ]}
            yAxisLabel="Camera Count"
          />
        </Box>
      </Grid>
    </Grid>
  ),
},
  // -------- TAB 2: Camera Uptime --------
  {
    label: "Camera Uptime",
    content: (
      <Grid container sx={{ height: "100%", minHeight: 0 }}>
        <Grid size={{ xs: 12 }} sx={{ display: "flex", height: "100%", minHeight: 0 }}>
          <DynamicBarChart
            data={cameraUptimeDowntimeData}
            xAxisKey="camera"
            series={[
              { dataKey: "uptime", label: "Uptime %", color: DASHBOARD_COLORS.success },
              { dataKey: "downtime", label: "Downtime %", color: DASHBOARD_COLORS.workforce },
            ]}
            yAxisLabel="Percentage (%)"
          />
        </Grid>
      </Grid>
    ),
  },

  // -------- TAB 3: Top Cameras --------
  {
    label: "Top Cameras",
    content: (
      <Grid container sx={{ height: "100%", minHeight: 0 }}>
        <Grid size={{ xs: 12 }} sx={{ display: "flex", height: "100%", minHeight: 0 }}>
          <DynamicBarChart
            // Use the same data but sort by uptime descending and take top 5
            data={[...cameraUptimeDowntimeData]
              .sort((a, b) => b.uptime - a.uptime)
              .slice(0, 5)}
            xAxisKey="camera"
            series={[
              { dataKey: "uptime", label: "Uptime %", color: DASHBOARD_COLORS.success },
            ]}
            yAxisLabel="Uptime %"
          />
        </Grid>
      </Grid>
    ),
  },

  // -------- TAB 4: Camera Healthy Summary --------
  {
    label: "Camera Healthy Summary",
    content: (
      <Grid container sx={{ height: "100%", minHeight: 0 }}>
        <Grid size={{ xs: 12 }} sx={{ display: "flex", height: "100%", minHeight: 0 }}>
          <DynamicBarChart
            data={cameraHealthByZone}
            xAxisKey="zone"
            series={[
              { dataKey: "online", label: "Online", color: DASHBOARD_COLORS.success },
              { dataKey: "offline", label: "Offline", color: DASHBOARD_COLORS.workforce },
              { dataKey: "tampered", label: "Tampered", color: DASHBOARD_COLORS.warning },
            ]}
            yAxisLabel="Camera Count"
          />
        </Grid>
      </Grid>
    ),
  },
];

  // return (
  //   <Paper
  //     sx={{
  //       display: "flex",
  //       flexDirection: "column",
  //       flexGrow: 1,
  //       pt: 2,
  //       px: 3,
  //       minHeight: 0, // ✅ allow shrinking
  //       overflow: "hidden", // ✅ prevent runaway growth
  //     }}
  //   >
  //     {/* Top Right Time Filter */}
  //     <Box
  //       sx={{
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "end",
  //         flexWrap: "wrap",
  //         mb: 2,
  //       }}
  //     >
  //         <CollapsibleTimeFilter onRangeChange={() => console.log("on range chnaged")}/>
  //     </Box>

  //     {/* KPI Cards Grid */}
  //     <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="stretch">
  //       {kpiData.map((kpi, index) => (
  //         <Grid
  //           size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}
  //           key={uuidv4() + index}
  //         >
  //           <DashboardKpiCard {...kpi} />
  //         </Grid>
  //       ))}
  //     </Grid>

  //     {/* Tabs Section */}
  //     <Box
  //       sx={{
  //         display: "flex",
  //         flexDirection: "column",
  //         flex: 1,
  //         //  minHeight: 0,

  //         minHeight: { xs: "500px", sm: "600px", md: 0 },
  //       }}
  //     >
  //       <DashboardTabs tabs={tabs} features={[]} />
  //     </Box>
  //   </Paper>
  // );
return (
  <Paper
    sx={{
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      pt: 2,
      px: 3,
      minHeight: 0,
      overflow: "hidden",
    }}
  >
    {/* Cards + Filter in one flex row */}
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        mb: 2,
      }}
    >
      <Grid container spacing={1.5} sx={{ flex: 1 }}>
        {kpiData.map((kpi, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={uuidv4() + index}>
            <DashboardKpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ ml: 2, flexShrink: 0 }}>
        <CollapsibleTimeFilter onRangeChange={() => console.log("on range changed")} />
      </Box>
    </Box>

    {/* Tabs Section */}
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 400,
        maxHeight: "60vh",
        overflow: "hidden",
      }}
    >
      <DashboardTabs tabs={tabs} features={[]} />
    </Box>
  </Paper>
);
}
