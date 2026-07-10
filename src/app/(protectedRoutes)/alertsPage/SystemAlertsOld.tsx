"use client";
import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { Warning, DirectionsCar } from "@mui/icons-material";
import AlertStatsCard from "../../components/molecules/AlertStatsCard/AlertStatsCard";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import SafetyIcon from "@mui/icons-material/Shield";
import Visibility from "@mui/icons-material/Visibility";
import WorkforceIcon from "@mui/icons-material/People";
import FaceRecognitionIcon from "@mui/icons-material/CenterFocusWeak";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import { v4 as uuidv4 } from "uuid";
import  {
  TabConfig,
} from "../../components/organisms/DashboardTabs/DashboardTabs";

const sampleData = [
  {
    id: "SC-001",
    useCaseType: "PPE Detection",
    detectionTime: "2025-09-24 08:15",
    zone: "Zone A",
    camera: "Camera-01",
  },
  {
    id: "SC-002",
    useCaseType: "Object Detection",
    detectionTime: "2025-09-24 09:20",
    zone: "Walking Bay 3",
    camera: "Camera-04",
  },
  {
    id: "SC-003",
    useCaseType: "Fire/Smoke/Oil/Gas",
    detectionTime: "2025-09-24 10:05",
    zone: "Zone C",
    camera: "Camera-02",
  },
  {
    id: "SC-004",
    useCaseType: "Vehicle Speed Monitoring",
    detectionTime: "2025-09-24 10:45",
    zone: "Entry Gate 2",
    camera: "Camera-07",
  },
  {
    id: "SC-005",
    useCaseType: "Fall Detection",
    detectionTime: "2025-09-24 11:30",
    zone: "Zone B",
    camera: "Camera-05",
  },
  {
    id: "SC-006",
    useCaseType: "STP/ETP Overflow Detection",
    detectionTime: "2025-09-24 12:15",
    zone: "STP Area",
    camera: "Camera-08",
  },
  {
    id: "SC-007",
    useCaseType: "Emergency Exit Blockage",
    detectionTime: "2025-09-24 12:50",
    zone: "Exit Zone 1",
    camera: "Camera-03",
  },
  {
    id: "SC-008",
    useCaseType: "Crowd Gathering",
    detectionTime: "2025-09-24 13:20",
    zone: "Hazard Zone 4",
    camera: "Camera-09",
  },
];

const SystemAlerts: React.FC = () => {
  const alertStats = [
    { value: "0", label: "Total Alerts" },
    { value: "2", label: "Safety and Compliances" },
    { value: "3", label: "Security Monitoring" },
    { value: "2", label: "Workforce Monitoring" },
    { value: "3", label: "Operational Insight" },
    { value: "3", label: "Facial Recognition" },
  ];

  const alertTables = [
    { key: "safety", label: "Safety & Compliances", icon: <SafetyIcon /> },
    { key: "security", label: "Surveillance Monitoring", icon: <Visibility /> },
    {
      key: "workforce",
      label: "Workforce Monitoring",
      icon: <WorkforceIcon />,
    },
    {
      key: "operational",
      label: "Vehicle Operational Insight",
      icon: <DirectionsCar />,
    },
    {
      key: "facial",
      label: "Facial Recognition",
      icon: <FaceRecognitionIcon />,
    },
  ];

  // 🔹 Common handlers
  const handleReset = () => console.log("Reset clicked");
  const handleExport = (format: "csv" | "pdf") =>
    console.log("Export:", format);

  // 🔹 Define all tab contents
  const tabs: TabConfig[] = alertTables.map((t) => ({
    label: (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {t.icon}
        <span>{t.label}</span>
      </Box>
    ),
    content: (
      <ReportTable
        totalCount={4}
        page={0}
        rowsPerPage={10}
        key={t.key}
        title={""}
        columns={[
          { id: "useCaseType", label: "Use Case Type", minWidth: 120 },
          { id: "detectionTime", label: "Timestamp", minWidth: 80 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "camera", label: "Camera", minWidth: 120 },
        ]}
        data={sampleData}
        filters={[
          {
            id: "useCaseType",
            label: "Use Case Type",
            type: "select",
            options: [
              "PPE Detection",
              "Object Detection",
              "Fire/Smoke/Oil/Gas",
              "Vehicle Speed Monitoring",
              "Fall Detection",
              "STP/ETP Overflow Detection",
              "Emergency Exit Blockage",
              "Crowd Gathering",
            ],
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: [
              "Zone A",
              "Walking Bay 3",
              "Zone B",
              "Zone C",
              "Entry Gate 2",
              "STP Area",
              "Exit Zone 1",
              "Hazard Zone 4",
            ],
          },
          {
            id: "camera",
            label: "Camera",
            type: "select",
            options: [
              "Camera-01",
              "Camera-02",
              "Camera-03",
              "Camera-04",
              "Camera-05",
              "Camera-07",
              "Camera-08",
              "Camera-09",
            ],
          },
          { id: "detectionTime", label: "Start Date", type: "date" },
          { id: "detectionTime", label: "End Date", type: "date" },
        ]}
        onReset={handleReset}
        onExport={handleExport}
        downloadFileName={`${t.key}-alerts`}
        loading={false}
        tooltipMessage="Shows the usecase violations"
      />
    ),
  }));

  return (
    <Paper
      sx={{
        pl: 3,
        pr: 3,
        pb: 3,
        pt: 2,
        mt: 1.2,
        mb: 4,
        borderRadius: 2,
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Warning sx={{ fontSize: 28, color: "#f44336" }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1c2025" }}
          >
            System Alerts & Notifications
          </Typography>
        </Box>
        <TimeFilter onRangeChange={() => console.log("on ranged changed")} />
      </Box>

      {/* Alert Stats */}
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {alertStats.map((stat, index) => (
          <Grid key={uuidv4() + index} size={{ xs: 12, sm: 6, md: 2 }}>
            <AlertStatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Dashboard Tabs */}
      {/* <DynamicTabs tabs={tabs} /> */}
    </Paper>
  );
};

export default SystemAlerts;
