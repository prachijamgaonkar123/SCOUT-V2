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
import DashboardKpiCard from "@/app/components/molecules/DashboardKpiCard/DashboardKpiCard";
import DashboardTabs, {
  TabConfig,
} from "@/app/components/organisms/DashboardTabs/DashboardTabs";
import DynamicBarChart from "@/app/components/organisms/BarChart/BarChart";
import JointBarGraphChart from "@/app/components/organisms/JointBarGraphChart/JointBarGraphChart";
import { v4 as uuidv4 } from "uuid";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import CameraStatusDonutChart from "@/app/components/organisms/DonutChart/DonutChart";

// -------------------- KPI DATA --------------------
const kpiData = [
  {
    title: "Total Cameras",
    violationsCount: 120,
    lastDetection: "System Overview",
    lastDetectionTime: "—",
    icon: VideocamOutlined,
    tooltipMessage:
      "Total number of surveillance cameras connected to the system.",
  },
  {
    title: "Cameras Online",
    violationsCount: 118,
    lastDetection: "Last Updated",
    lastDetectionTime: "10:15 AM",
    icon: WifiTethering,
    tooltipMessage: "Number of cameras currently active and transmitting data.",
    color: "#4caf50",
    bgColor: "#e8f5e9",
    borderColor: "#4caf50",
    iconBg: "#c8e6c9",
  },
  {
    title: "Cameras Offline",
    violationsCount: 2,
    lastDetection: "Zone B",
    lastDetectionTime: "09:45 AM",
    icon: WifiOff,
    tooltipMessage: "Shows cameras currently not transmitting video feed.",
  },
  {
    title: "Tampering Incidents Today",
    violationsCount: 6,
    lastDetection: "Zone B - Warehouse",
    lastDetectionTime: "09:58 AM",
    icon: WarningAmber,
    tooltipMessage:
      "Number of tampering incidents (blurred, covered, or offline) detected today.",
  },
  {
    title: "Zones Affected",
    violationsCount: 4,
    lastDetection: "Zone A, Zone B, Zone C",
    lastDetectionTime: "—",
    icon: Domain,
    tooltipMessage:
      "Total number of zones currently affected by camera issues.",
  },
];

// -------------------- SAMPLE DATA --------------------

const tamperingTrendData = [
  { time: "00:00", offline: 3, blur: 2, lensCovered: 1 },
  { time: "01:00", offline: 2, blur: 1, lensCovered: 1 },
  { time: "02:00", offline: 4, blur: 2, lensCovered: 2 },
  { time: "03:00", offline: 5, blur: 3, lensCovered: 2 },
  { time: "04:00", offline: 3, blur: 2, lensCovered: 1 },
  { time: "05:00", offline: 2, blur: 1, lensCovered: 1 },
  { time: "06:00", offline: 4, blur: 2, lensCovered: 2 },
  { time: "07:00", offline: 5, blur: 3, lensCovered: 3 },
  { time: "08:00", offline: 6, blur: 4, lensCovered: 3 },
  { time: "09:00", offline: 7, blur: 4, lensCovered: 4 },
  { time: "10:00", offline: 5, blur: 3, lensCovered: 2 },
  { time: "11:00", offline: 3, blur: 2, lensCovered: 2 },
  { time: "12:00", offline: 4, blur: 2, lensCovered: 1 },
  { time: "13:00", offline: 5, blur: 3, lensCovered: 2 },
  { time: "14:00", offline: 6, blur: 4, lensCovered: 3 },
  { time: "15:00", offline: 4, blur: 2, lensCovered: 1 },
  { time: "16:00", offline: 3, blur: 1, lensCovered: 1 },
  { time: "17:00", offline: 5, blur: 3, lensCovered: 2 },
  { time: "18:00", offline: 7, blur: 4, lensCovered: 3 },
  { time: "19:00", offline: 6, blur: 3, lensCovered: 2 },
  { time: "20:00", offline: 4, blur: 2, lensCovered: 1 },
  { time: "21:00", offline: 3, blur: 1, lensCovered: 1 },
  { time: "22:00", offline: 2, blur: 1, lensCovered: 1 },
  { time: "23:00", offline: 3, blur: 2, lensCovered: 1 },
];

const tamperingTypeData = [
  { label: "Offline", value: 40, color: "#ffcdd2" },
  { label: "Blur", value: 25, color: "#FFEAA7" },
  { label: "Lens Covered", value: 15, color: "#A8E6CF" },
  { label: "Online", value: 20, color: "#B3E5FC" },
];

const topCameras = [
  { camera: "CAM-007", incidents: 15 },
  { camera: "CAM-002", incidents: 13 },
  { camera: "CAM-010", incidents: 9 },
  { camera: "CAM-005", incidents: 7 },
  { camera: "CAM-004", incidents: 5 },
];

const cameraHealth = [
  { zone: "Gate 1", online: 6, offline: 1, tampered: 2 },
  { zone: "Warehouse", online: 4, offline: 2, tampered: 3 },
  { zone: "Office", online: 7, offline: 0, tampered: 1 },
  { zone: "Parking", online: 5, offline: 1, tampered: 2 },
];

const cameras = [
  "CAM-001",
  "CAM-002",
  "CAM-003",
  "CAM-004",
  "CAM-005",
  "CAM-006",
  "CAM-007",
];

const series = [
  {
    label: "Uptime %",
    data: [99, 97, 95, 92, 98, 94, 90],
    color: "#4CAF50",
  },
  {
    label: "Downtime %",
    data: [1, 3, 5, 8, 2, 6, 10],
    color: "#F44336",
  },
];

// -------------------- MAIN DASHBOARD --------------------
export default function CameraTamperingDashboard() {
  const tabs: TabConfig[] = [
    {
      label: "Tampering Trend",
      content: (
        <Grid
          container
          sx={{
            alignItems: "stretch",
            height: "100%",
          }}
        >
          {/* Left side: Bar chart */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              height: "100%",
              display: "flex",
              "& .MuiCardContent-root": {
                height: "100%",
              },
            }}
          >
            <DynamicBarChart
              data={tamperingTrendData}
              xAxisKey="time"
              series={[
                { dataKey: "offline", label: "Offline", color: "#ffcdd2" },
                { dataKey: "blur", label: "Blur", color: "#FFEAA7" },
                {
                  dataKey: "lensCovered",
                  label: "Lens Covered",
                  color: "#A8E6CF",
                },
              ]}
              yAxisLabel="Incident Count"
            />
          </Box>
          {/* Right side: Two pie charts stacked */}
          {/* 1) only shows the status distribution pie chart  */}
          {/* <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DynamicPieChart
                data={tamperingTypeData}
                count={2.8}
                carttitle="Camera Status Distribution"
              />
            </Box>
          </Grid> */}
          {/* 2) shows the donut chart for the camera status distrubtion */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CameraStatusDonutChart data={tamperingTypeData} />
            </Box>
          </Grid>
        </Grid>
      ),
    },

    {
      label: "Camera Uptime",
      content: (
        <Box
          sx={{
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            "& .MuiCardContent-root": {
              height: "100%",
            },
          }}
        >
          {/* <DynamicBarChart
            data={uptimeData}
            xAxisKey="camera"
            series={[
              { dataKey: "uptime", label: "Uptime %", color: "#A8E6CF" },
              { dataKey: "downtime", label: "Downtime %", color: "#ffcdd2" },
            ]}
            yAxisLabel="Percentage"
          /> */}
          <JointBarGraphChart times={cameras} seriesData={series} />
        </Box>
      ),
    },
    {
      label: "Top Cameras",
      content: (
        <Box
          sx={{
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            "& .MuiCardContent-root": {
              height: "100%",
            },
          }}
        >
          <DynamicBarChart
            data={topCameras}
            xAxisKey="camera"
            series={[
              { dataKey: "incidents", label: "Incidents", color: "#ffcdd2" },
            ]}
            yAxisLabel="Count"
          />
        </Box>
      ),
    },
    {
      label: "Camera Health Summary",
      content: (
        <Box
          sx={{
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            "& .MuiCardContent-root": {
              height: "100%",
            },
          }}
        >
          <DynamicBarChart
            data={cameraHealth}
            xAxisKey="zone"
            series={[
              { dataKey: "online", label: "Online", color: "#A8E6CF" },
              { dataKey: "offline", label: "Offline", color: "#ffcdd2" },
              { dataKey: "tampered", label: "Tampered", color: "#FFEAA7" },
            ]}
            yAxisLabel="Cameras"
          />
        </Box>
      ),
    },
  ];

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        pt: 2,
        px: 3,
        backgroundColor: "#ffffff",
        borderRadius: 2,
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Top Filter */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <TimeFilter />
      </Box>

      {/* KPI Cards */}

      <Grid container spacing={1.5} sx={{ mb: 1 }} alignItems="stretch">
        {kpiData.map((kpi, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}
            key={uuidv4() + index}
          >
            <DashboardKpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>
      {/* Tabs Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <DashboardTabs tabs={tabs} />
      </Box>
    </Paper>
  );
}
