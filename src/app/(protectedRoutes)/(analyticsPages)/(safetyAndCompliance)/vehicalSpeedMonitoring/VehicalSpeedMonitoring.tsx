"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { Speed, TrendingUp, LocationOn, AccessTime } from "@mui/icons-material";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";

import { v4 as uuidv4 } from "uuid";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";

import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";

const VehicalSpeedMonitoring: React.FC = () => {
  interface VehicleViolation {
    voilation: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;
    vehicleType: string;
    vehicleNumber: string;
    [key: string]: string | number | boolean;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<VehicleViolation | null>(
    null,
  );
  const backendVehicleData = [
    {
      id: 301,
      speed: 65,
      vehicleType: "Truck",
      vehicleNumber: "MH12AB1234",
      zone: "Main Gate",
      camera: "CAM-09",
      snapshot: "https://picsum.photos/400/200?random=9",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:05",
      updatedAt: "2025-09-23 17:06",
    },
    {
      id: 302,
      speed: 55,
      vehicleType: "Car",
      vehicleNumber: "MH14XY5678",
      zone: "Parking Lot",
      camera: "CAM-10",
      snapshot: "https://picsum.photos/400/200?random=10",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:15",
      updatedAt: "2025-09-23 17:16",
    },
    {
      id: 301,
      speed: 65,
      vehicleType: "Truck",
      vehicleNumber: "MH12AB1234",
      zone: "Main Gate",
      camera: "CAM-09",
      snapshot: "https://picsum.photos/400/200?random=9",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:05",
      updatedAt: "2025-09-23 17:06",
    },
    {
      id: 302,
      speed: 58,
      vehicleType: "Car",
      vehicleNumber: "MH14XY5678",
      zone: "Parking Lot",
      camera: "CAM-10",
      snapshot: "https://picsum.photos/400/200?random=10",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:15",
      updatedAt: "2025-09-23 17:16",
    },
  ];

  const recentVehicleViolations = backendVehicleData.map((item) => {
    let violationMsg = "";

    // Example rule: If speed > 40 inside premises, it’s a violation
    if (item.speed > 40) {
      violationMsg = `Overspeeding detected (${item.speed} km/h)`;
    } else {
      violationMsg = "No violation";
    }

    return {
      voilation: violationMsg,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
      vehicleType: item.vehicleType || "Unknown",
      vehicleNumber: item.vehicleNumber || "N/A",
    };
  });
  console.log("vehical speed voilation", recentVehicleViolations);
  const VehicalSpeedMonitoringKpiData = [
    {
      title: "Speed Violation Count",
      value: "267",
      icon: Speed,
      tooltipMessage:
        "Total number of detected vehicle speed violations inside the premises.",
    },
    {
      title: "Highest Speed Recorded",
      value: "110 km/h",
      icon: TrendingUp,
      tooltipMessage:
        "The maximum speed recorded among all monitored vehicles.",
    },
    {
      title: "Highest Speed Violation Zone",
      value: "Zone 3",
      icon: LocationOn,
      tooltipMessage:
        "The zone where the highest vehicle speed violation was detected.",
    },
    {
      title: "Last Detection Time",
      value: "11:15 AM",
      icon: AccessTime,
      tooltipMessage:
        "The time when the most recent vehicle speed violation was detected.",
    },
  ];

  const zoneViolationsData = [
    {
      zone: "Main Gate",
      violations: 2,
    },
    {
      zone: "Parking Lot",
      violations: 2,
    },
  ];

  const KpiCardLoading = false;
  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    const violation = row as VehicleViolation;
    setViewPopupData(violation);
    setViewPopupOpen(true);
  };
  const skeletonKeys = Array.from({ length: 6 }, () => uuidv4());
  return (
    <Box>
      {/* KPI Cards */}
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
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
              <Box component="span" sx={{ mr: 2 }}>
                📊 Overview
              </Box>
            </Typography>
          </Box>

          <TimeFilter onRangeChange={() => console.log("on range chnaged")} />
        </Box>
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
              VehicalSpeedMonitoringKpiData.map((kpi, index) => (
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
              violations={recentVehicleViolations}
              loading={false}
              tooltipMessage="Latest 20 vehical overspeeding detected with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows vehical overspeeding violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Report */}
      <ReportTable
        totalCount={4}
        page={0}
        rowsPerPage={10}
        title="Detailed Report"
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        columns={[
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 150 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 150 },

          { id: "vehicleType", label: "Vehicle Type", minWidth: 120 },
          { id: "vehicleNumber", label: "Vehicle Number", minWidth: 150 },
        ]}
        data={recentVehicleViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentVehicleViolations.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentVehicleViolations.map((v) => v.cameraId)),
            ),
          },
          {
            id: "alarmTriggered",
            label: "Alarm Triggered",
            type: "select",
            options: ["true", "false"],
          },
          {
            id: "vehicleType",
            label: "Vehicle Type",
            type: "select",
            options: Array.from(
              new Set(recentVehicleViolations.map((item) => item.vehicleType)),
            ),
          },
          {
            id: "vehicleNumber",
            label: "Vehicle Number",
            type: "select",
            options: Array.from(
              new Set(
                recentVehicleViolations.map((item) => item.vehicleNumber),
              ),
            ),
          },
          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        downloadFileName="vehicle-detection-report"
        loading={false}
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

export default VehicalSpeedMonitoring;
