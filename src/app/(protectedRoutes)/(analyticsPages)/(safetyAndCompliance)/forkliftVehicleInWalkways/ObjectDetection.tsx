"use client";

import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import {
  DirectionsCar,
  Block,
  CheckCircle,
  LocationOn,
} from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ForkliftIcon from "@mui/icons-material/Forklift";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
const ObjectDetection: React.FC = () => {
  interface ForkliftDetectionEvent {
    voilation: string;
    objectName?: string;
    imageUrl: string;
    zone: string;
    cameraId: string;
    time: string;

    alarmTriggered: boolean;
    [key: string]: string | number | boolean | undefined;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<ForkliftDetectionEvent | null>(null);
  const ObjectDetectionKpiData = [
    {
      title: "Blocked Walkways",
      value: "8",
      tooltipMessage:
        "Shows the total number of walkways that are currently blocked.",
      icon: Block,
    },
    {
      title: "Clear Walkways",
      value: "12",
      tooltipMessage:
        "Shows the total number of walkways that are currently clear and safe for use.",
      icon: CheckCircle,
      trendColor: "#4caf50",
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      iconBg: "rgba(76, 175, 80, 0.1)",
    },
    {
      title: "Affected Zones (Last 3)",
      value: "Zone A, Zone B, Zone C",
      tooltipMessage:
        "Displays the last three zones where blocked Walkways were detected.",
      icon: LocationOn,
    },
  ];

  const backendData = [
    {
      id: 201,
      detected: true,
      objectName: "Forklift",
      snapshot: "/img/v3.jpg",
      zone: "Walkway Zone A",
      camera: "CAM-101",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 09:20",
    },
    {
      id: 202,
      detected: true,
      objectName: "Vehicle",
      snapshot: "/img/v5.jpg",
      zone: "Walkway Zone B",
      camera: "CAM-102",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 09:32",
    },
    {
      id: 203,
      detected: true,
      objectName: "Forklift",
      snapshot: "/img/v3.jpg",
      zone: "Walkway Zone C",
      camera: "CAM-103",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 10:10",
    },
    {
      id: 204,
      detected: true,
      objectName: "Vehicle",
      snapshot: "/img/v5.jpg",
      zone: "Walkway Zone A",
      camera: "CAM-104",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 10:30",
    },
    {
      id: 205,
      detected: true,
      objectName: "Forklift",
      snapshot: "/img/v5.jpg",
      zone: "Walkway Zone B",
      camera: "CAM-105",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 11:05",
    },
    {
      id: 203,
      detected: true,
      objectName: "Forklift",
      snapshot: "/img/v3.jpg",
      zone: "Walkway Zone C",
      camera: "CAM-103",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 10:10",
    },
    {
      id: 204,
      detected: true,
      objectName: "Vehicle",
      snapshot: "/img/v5.jpg",
      zone: "Walkway Zone A",
      camera: "CAM-104",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 10:30",
    },
    {
      id: 205,
      detected: true,
      objectName: "Forklift",
      snapshot: "/img/v1.jpg",
      zone: "Walkway Zone B",
      camera: "CAM-105",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 11:05",
    },
  ];
  const recentDetections = backendData.map((item) => {
    return {
      voilation: "Walkway Blocked ",
      objectName: item.objectName,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
    };
  });

  const zoneViolationsData = [
    {
      zone: "Walkway Zone A",
      violations: 3,
      subViolations: [
        { label: "Forklift", value: 1, icon: ForkliftIcon },
        { label: "Vehicle", value: 2, icon: DirectionsCar },
      ],
    },
   
    {
      zone: "Walkway Zone C",
      violations: 2,
      subViolations: [
        { label: "Forklift", value: 1, icon: ForkliftIcon },
        { label: "Vehicle", value: 1, icon: DirectionsCar },
      ],
    },
  ];

  interface FilterParams {
    zone?: string;
    status?: string;
    priority?: string;
    minOccupancy?: string;
    maxOccupancy?: string;
    startDate?: string;
    endDate?: string;
  }

  const handleSubmitFilter = async (filters: FilterParams) => {
    console.log("Selected Filters:", filters);
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
    console.log("view single row", row);
    setViewPopupData(row as ForkliftDetectionEvent);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = ObjectDetectionKpiData.map((kpi) => ({
    icon: kpi.icon,
    value: kpi.value,
    label: kpi.title,
    tone: /zone|time|incidence/i.test(kpi.title) ? "info" : "red",
  }));

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
      {/* KPI Cards */}
      <Paper
        sx={{
          p: 2.2,
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
              onRangeChange={function (range: {
                start: string;
                end: string;
              }): void {
                throw new Error("Function not implemented.");
              }}
            />
          </Box>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Recent  Violations */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              tooltipMessage="Latest 20 Forklift / Vehicle detected in Walkways with details."
              label="Recent Violations"
              violations={recentDetections}
              loading={false}
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/* Object detection Report */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed detection events for forklifts/vehicles in walkways with filter, reset, and export options."
        columns={[
          { id: "voilation", label: "Voilation", minWidth: 150 },
          { id: "objectName", label: "Object Name", minWidth: 120 },
          { id: "time", label: " Time", minWidth: 150 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Camera", minWidth: 120 },

          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 120 },
        ]}
        data={recentDetections} // The mapped backend data for this case
        filters={[
          {
            id: "objectName",
            label: "Object Name",
            type: "select",
            options: Array.from(
              new Set(recentDetections.map((v) => v.objectName))
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(new Set(recentDetections.map((v) => v.zone))),
          },
          {
            id: "cameraId",
            label: "Camera",
            type: "select",
            options: Array.from(
              new Set(recentDetections.map((v) => v.cameraId))
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
        downloadFileName="forklift-vehicle-detection-report"
        loading={false} totalCount={0} page={0} rowsPerPage={0}      />

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

export default ObjectDetection;
