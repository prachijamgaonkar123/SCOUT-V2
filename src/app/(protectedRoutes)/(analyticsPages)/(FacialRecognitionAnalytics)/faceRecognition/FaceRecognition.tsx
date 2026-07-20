"use client";

import React from "react";
import CameraStatus from "@/app/components/organisms/CameraStatus/CameraStatus";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  CheckCircle,
  AccessTime,
  Cancel,
  PersonAddAlt,
  Login,
  Logout,
  Groups,
} from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import { v4 as uuidv4 } from "uuid";
import { CameraZone } from "@/app/types";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
const FaceRecognition: React.FC = () => {
  const skeletonKeys = Array.from({ length: 6 }, () => uuidv4());
  const FaceRecognitionKpiData = [
    {
      title: "Total Employees",
      value: "120",
      icon: Groups,
    },
    {
      title: "Present",
      value: "7",
      icon: CheckCircle,
    },
    {
      title: "Absent",
      value: "0",
      icon: Cancel,
    },
    {
      title: "Late Arrivals",
      value: "0",
      icon: AccessTime,
    },
    {
      title: "Early Arrivals",
      value: "8",
      icon: PersonAddAlt,
    },
    {
      title: "Total Entries",
      value: "134",
      icon: Login,
    },
    {
      title: "Total Exits",
      value: "128",
      icon: Logout,
    },
  ];

  const recentViolations = [
    {
      Voilation: "Hard hat missing",
      zone: "Production Zone A",
      time: "14:32",

      imageUrl: "/img/p3.avif",
    },
    {
      Voilation: "Safety vest not worn",
      zone: "Warehouse Zone B",
      time: "14:18",

      imageUrl: "/img/p2.png",
    },
  ];
  const cameraZones: CameraZone[] = [
    {
      zone: "Production Floor",
      active: 8,
      total: 10,
      offline: 3,
      tempred: 4,
    },
    { zone: "Warehouse", active: 3, total: 6, offline: 3, tempred: 4 },
    { zone: "Parking Area", active: 4, total: 5, offline: 1, tempred: 2 },
    { zone: "Main Entrance", active: 2, total: 3, offline: 1, tempred: 2 },
    { zone: "Assembly Line", active: 2, total: 4, offline: 1, tempred: 2 },
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
  const KpiCardLoading = false;
  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <PersonAddAltIcon sx={{ fontSize: 28, color: "#1976d2" }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1c2025" }}
          >
            Face Recognition for Entry/Exit Logging
          </Typography>
        </Box>
      </Box>
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
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* <ShowChartIcon sx={{ color: "#1976d2", fontSize: 24 }} /> */}
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
              <Box component="span" sx={{ mr: 2 }}>
                📊 Overview
              </Box>
            </Typography>
          </Box>

          <TimeFilter onRangeChange={() => console.log("on chnaged click")} />
        </Box>
        {/* KPI Cards */}

        <Grid container spacing={2.5} sx={{ mb: 4 }} alignItems="stretch">
          {KpiCardLoading
            ? // Show skeletons while loading
              skeletonKeys.map((index) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                  key={uuidv4() + index}
                >
                  <KpiCardSkeleton />
                </Grid>
              ))
            : // Show actual KPI cards
              FaceRecognitionKpiData.map((kpi, index) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                  key={uuidv4() + index}
                >
                  <KpiCard {...kpi} />
                </Grid>
              ))}
        </Grid>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Recent  Violations */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Violations"
              violations={recentViolations}
              loading={false}
              tooltipMessage="recent voialtion"
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <CameraStatus cameraZones={cameraZones} loading={false} />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        totalCount={4}
        page={0}
        rowsPerPage={10}
        title="Detailed Report"
        columns={[
          { id: "firstName", label: "First Name", minWidth: 120 },
          { id: "lastName", label: "Last Name", minWidth: 120 },
          { id: "type", label: "Type", minWidth: 100 },
          { id: "zones", label: "Zones", minWidth: 150 },
          { id: "camera", label: "Camera", minWidth: 150 },
          { id: "time", label: "Timestamp", minWidth: 150 },
        ]}
        data={[
          {
            firstName: "John",
            lastName: "Doe",
            type: "Entry",
            zones: "Main Gate",
            camera: "CAM-101",
            time: "2025-09-24 08:15:00",
          },
          {
            firstName: "Jane",
            lastName: "Smith",
            type: "Exit",
            zones: "Side Gate",
            camera: "CAM-102",
            time: "2025-09-24 08:45:00",
          },
          {
            firstName: "Alice",
            lastName: "Johnson",
            type: "Entry",
            zones: "Rear Gate",
            camera: "CAM-103",
            time: "2025-09-24 09:00:00",
          },
          {
            firstName: "Bob",
            lastName: "Williams",
            type: "Exit",
            zones: "Main Gate",
            camera: "CAM-104",
            time: "2025-09-24 09:30:00",
          },
        ]}
        filters={[
          {
            id: "firstName",
            label: "First Name",
            type: "select",
            options: ["John", "Jane", "Alice", "Bob"],
          },
          {
            id: "lastName",
            label: "Last Name",
            type: "select",
            options: ["Doe", "Smith", "Johnson", "Williams"],
          },
          {
            id: "type",
            label: "Type",
            type: "select",
            options: ["Entry", "Exit"],
          },
          {
            id: "zones",
            label: "Zones",
            type: "select",
            options: ["Main Gate", "Side Gate", "Rear Gate"],
          },
          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        downloadFileName="face-recognition-entry-exit-report"
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        loading={false}
        tooltipMessage="report table"
      />
    </Box>
  );
};

export default FaceRecognition;
