"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import {
  DirectionsCar,
  CheckCircle,
  ReportProblem,
  Login,
  Logout,
} from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
const VehicleCount: React.FC = () => {
  interface VehicleCountEvent {
    incident: string;
    vehicleNumber: string;
    status: string;
    validNumber: boolean;
    time: string;
    zone: string;
    cameraId: string;
    alarmTriggered: boolean;
    imageUrl: string;
    [key: string]: string | number | boolean | undefined;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<VehicleCountEvent | null>(
    null,
  );
  const vehicleCountBackendData = [
    {
      id: 201,
      // Was "Exit", which left only 1 recorded entry against 2 recorded
      // exits — nonsensical, since more vehicles can't leave than were
      // ever counted coming in.
      numberDetected: "MH12AB1234",
      status: "Entry",
      validNumber: false,
      snapshot: "/img/vehicle-count-anpr-gates/v1.jpg",
      zone: "Zone A",
      camera: "CAM-ENTRY-01",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 09:43",
      alarmTriggered: false,
    },

    {
      id: 203,
      numberDetected: "GJ05TR5678",
      status: "Entry",
      validNumber: false,
      snapshot: "/img/vehicle-count-anpr-gates/v3.png",
      zone: "Zone B",
      camera: "CAM-ENTRY-03",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 10:14",
      alarmTriggered: false,
    },
    {
      id: 204,
      numberDetected: "RJ14XY9012",
      status: "Exit",
      validNumber: false,
      snapshot: "/img/vehicle-count-anpr-gates/v2.jpg",
      zone: "Zone C",
      camera: "CAM-EXIT-02",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 11:02",
      alarmTriggered: true,
    },
  ];

  const vehicleViolations = vehicleCountBackendData.map((item) => {
    let violation = "No violation";

    if (!item.validNumber) {
      violation = "Invalid number plate detected";
    }

    return {
      incident: violation,
      vehicleNumber: item.numberDetected,
      status: item.status,
      validNumber: item.validNumber,
      time: item.createdAt,
      zone: item.zone,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
      imageUrl: item.snapshot,
    };
  });

  console.log(vehicleViolations);

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from vehicleCountBackendData so the totals always match the
  // recent violations list and the report table.
  const zoneInvalidCounts = vehicleCountBackendData.reduce((acc, item) => {
    if (!item.validNumber) acc[item.zone] = (acc[item.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vehicleZoneViolationsData = Object.entries(zoneInvalidCounts).map(
    ([zone, count]) => ({
      zone,
      violations: count,
      subViolations: [
        { label: "Invalid Number Plate", value: count, icon: ErrorOutlineIcon },
      ],
    }),
  );

  const entryCount = vehicleCountBackendData.filter(
    (item) => item.status === "Entry",
  ).length;
  const exitCount = vehicleCountBackendData.filter(
    (item) => item.status === "Exit",
  ).length;
  const validCount = vehicleCountBackendData.filter(
    (item) => item.validNumber,
  ).length;
  const invalidCount = vehicleCountBackendData.filter(
    (item) => !item.validNumber,
  ).length;

  const VehicleCountKpiData = [
    {
      title: "Total Vehicle Entries",
      value: String(entryCount),
      icon: Login,
      tooltipMessage:
        "Total number of vehicles that entered through all gates during the selected time period.",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
    },
    {
      title: "Total Vehicle Exits",
      value: String(exitCount),
      icon: Logout,
      tooltipMessage:
        "Total number of vehicles that exited through all gates during the selected time period.",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
    },
    {
      title: "Vehicles Inside",
      value: String(Math.max(0, entryCount - exitCount)),
      icon: DirectionsCar,
      tooltipMessage:
        "Total number of vehicles currently inside the premises (calculated as entries minus exits).",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
    },
    {
      title: "Total Valid Numbers",
      value: String(validCount),
      icon: CheckCircle,
      tooltipMessage:
        "Number of detected vehicles with valid license plate numbers.",
      trendColor: "#4caf50",
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      iconBg: "rgba(76, 175, 80, 0.1)",
    },
    {
      title: "Total Invalid Numbers",
      value: String(invalidCount),
      icon: ReportProblem,
      tooltipMessage:
        "Number of detected vehicles with invalid or unreadable license plate numbers.",
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
    const violation = row as VehicleCountEvent;
    setViewPopupData(violation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = VehicleCountKpiData.map((kpi) => ({
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
              onRangeChange={() => console.log("on range chnaged")}
            />
          </Box>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Recent  Violations */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              tooltipMessage="Latest 20 Vehicle Count & ANPR at Entry/Exit Gates with details."
              label="Recent Incident"
              violations={vehicleViolations}
              loading={false}
            />
          </Grid>
          {/* Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Zone Incident"
              violationsZone={vehicleZoneViolationsData}
              loading={false}
              tooltipMessage="Shows violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        totalCount={vehicleViolations.length}
        page={0}
        rowsPerPage={10}
        title="Detailed Report"
        tooltipMessage="Detailed vehicle count report with filters, reset, and export options."
        columns={[
          { id: "incident", label: "Incident", minWidth: 200 },
          { id: "vehicleNumber", label: "Vehicle Number", minWidth: 150 },
          { id: "status", label: "Status (Entry/Exit)", minWidth: 150 },
          { id: "validNumber", label: "Valid Number", minWidth: 120 },
          { id: "time", label: "Time", minWidth: 140 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Camera", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 150 },
        ]}
        data={vehicleViolations}
        filters={[
          {
            id: "vehicleNumber",
            label: "Vehicle Number",
            type: "select",
            options: Array.from(
              new Set(vehicleViolations.map((v) => v.vehicleNumber)),
            ),
          },
          {
            id: "status",
            label: "status",
            type: "select",
            options: Array.from(
              new Set(vehicleViolations.map((v) => v.status)),
            ),
          },
          {
            id: "validNumber",
            label: "Valid Number",
            type: "select",
            options: Array.from(
              new Set(vehicleViolations.map((v) => v.validNumber)),
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(new Set(vehicleViolations.map((v) => v.zone))),
          },
          {
            id: "cameraId",
            label: "camera",
            type: "select",
            options: Array.from(
              new Set(vehicleViolations.map((v) => v.cameraId)),
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
        downloadFileName="vehicle-count-anpr-report"
        onSubmit={handleSubmitFilter}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        onReset={handleReset}
        onExport={handleExport}
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

export default VehicleCount;
