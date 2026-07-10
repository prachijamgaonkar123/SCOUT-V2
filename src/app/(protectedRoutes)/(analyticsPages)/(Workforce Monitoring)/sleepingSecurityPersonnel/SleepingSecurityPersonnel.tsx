"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import { v4 as uuidv4 } from "uuid";
import { AccessTime, LocationOn, Security } from "@mui/icons-material";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";

import PersonOffIcon from "@mui/icons-material/PersonOff";
import HotelIcon from "@mui/icons-material/Hotel";
const SleepingSecurityPersonnel: React.FC = () => {
  interface SleepingSecurityViolation {
    voilation: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;
    [key: string]: string | number | boolean;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<SleepingSecurityViolation | null>(null);
  const skeletonKeys = Array.from({ length: 4 }, () => uuidv4());

  const SleepingSecurityPersonnelKpiData = [
    {
      title: "Security Presence",
      value: "2",
      icon: Security,
      tooltipMessage:
        "Shows the number of security personnel currently present.",
      trendColor: "#4caf50",
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      iconBg: "rgba(76, 175, 80, 0.1)",
    },
    {
      title: "Last Incidence",
      value: "10:45 AM",
      icon: AccessTime,
      tooltipMessage:
        "Displays the time of the most recent incident involving security personnel.",
    },
    {
      title: "Zone Violations",
      value: "Zone A, Zone C",
      icon: LocationOn,
      tooltipMessage:
        "Lists the zones where sleeping security personnel violations were detected.",
    },
  ];
  const backendSleepingSecurityData = [
    {
      id: 901,
      sleeping: true,
      absence: false,
      snapshot: "https://picsum.photos/400/200?random=51",
      zone: "Main Gate",
      camera: "CAM-51",
      createdAt: "2025-09-24 08:15",
      updatedAt: "2025-09-24 08:17",
    },
    {
      id: 902,
      sleeping: false,
      absence: true,
      snapshot: "https://picsum.photos/400/200?random=52",
      zone: "Assembly Line A",
      camera: "CAM-52",
      createdAt: "2025-09-24 08:25",
      updatedAt: "2025-09-24 08:27",
    },
    {
      id: 901,
      sleeping: true,
      absence: false,
      snapshot: "https://picsum.photos/400/200?random=51",
      zone: "Main Gate",
      camera: "CAM-51",
      createdAt: "2025-09-24 08:15",
      updatedAt: "2025-09-24 08:17",
    },
    {
      id: 902,
      sleeping: false,
      absence: true,
      snapshot: "https://picsum.photos/400/200?random=52",
      zone: "Assembly Line A",
      camera: "CAM-52",
      createdAt: "2025-09-24 08:25",
      updatedAt: "2025-09-24 08:27",
    },
  ];

  const recentViolations = backendSleepingSecurityData.map((item) => {
    const titleParts = [];

    if (item.sleeping) titleParts.push("Security personnel sleeping detected");
    if (item.absence) titleParts.push("Security personnel absence detected");

    return {
      voilation: titleParts.join(", ") || "No violation",
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.sleeping || item.absence,
    };
  });

  const zoneViolationsData = [
    {
      zone: "Main Gate",
      violations: 3,
      subViolations: [
        {
          label: "Sleeping",
          value: 2,
          icon: HotelIcon,
        },
        {
          label: "Absence",
          value: 1,
          icon: PersonOffIcon,
        },
      ],
    },
    {
      zone: "Assembly Line A",
      violations: 2,
      subViolations: [
        {
          label: "Sleeping",
          value: 1,
          icon: HotelIcon,
        },
        {
          label: "Absence",
          value: 1,
          icon: PersonOffIcon,
        },
      ],
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
  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    const violation = row as SleepingSecurityViolation;
    setViewPopupData(violation);
    setViewPopupOpen(true);
  };
  const KpiCardLoading = false;
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

          <TimeFilter onRangeChange={() => console.log("on range chnaged")} />
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
              SleepingSecurityPersonnelKpiData.map((kpi, index) => (
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
              tooltipMessage="Latest 20 Security personnel sleeping,absence detection with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows security personnel sleeping,absence violations per zone"
            />
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
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 140 },
          { id: "zone", label: "Zone", minWidth: 150 },

          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
        ]}
        data={recentViolations}
        filters={[
          {
            id: "voilation",
            label: "Violation",
            type: "select",
            options: Array.from(
              new Set(recentViolations.map((item) => item.voilation)),
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentViolations.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentViolations.map((v) => v.cameraId)),
            ),
          },
          {
            id: "alarmTriggered",
            label: "Alarm Triggered",
            type: "select",
            options: ["true", "false"],
          },
          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        downloadFileName="sleeping-absence-report"
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        loading={false}
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        onView={handleViewSingle}
      />

      {/* View Alert Popup */}
      {viewPopupData && (
        <ViewAlertPopup
          open={viewPopupOpen}
          handleClose={() => setViewPopupOpen(false)}
          details={viewPopupData}
          imageKey="imageUrl"
          onDownload={(url) => console.log("Download:", url)}
        />
      )}
    </Box>
  );
};

export default SleepingSecurityPersonnel;
