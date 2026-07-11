"use client";

import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { Groups, LocationOn, AccessTime } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const EmployeePresenceRestrictedAreaPage: React.FC = () => {
  interface EmployeePresenceViolation {
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
    useState<EmployeePresenceViolation | null>(null);
  const employeeRestrictedPresenceKpiData = [
    {
      title: "Employees in Restricted Area",
      value: "12", // Number of employees detected in critical areas
      icon: Groups, // 👥 Represents group of people
      trendColor: "#f44336",
      color: "#f44336",
      bgColor: "#ffebee",
      borderColor: "#f44336",
      iconBg: "rgba(244, 67, 54, 0.1)",
      tooltipMessage:
        "Shows the number of employees detected in restricted areas.",
    },
    {
      title: "Zone Violations",
      value: "3 (Zone A, Zone B, Zone C)", // Number of violations and zones
      icon: LocationOn, // 📍 Zone/location indicator
      tooltipMessage:
        "Displays the count and name of restricted zones where employees entered .",
    },
    {
      title: "Last Incidence",
      value: getOneHourBefore().time, // Time of last detected violation
      icon: AccessTime, // ⏰ Time
      tooltipMessage:
        "Most recent time employees were detected in restricted zones.",
    },
  ];
  const backendEmployeePresenceData = [
    {
      id: 201,
      snapshot: "https://picsum.photos/400/200?random=11",
      zone: "Restricted Zone A",
      camera: "CAM-11",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-25 09:16",
      alarmTriggered: true,
    },
    {
      id: 202,
      snapshot: "https://picsum.photos/400/200?random=12",
      zone: "Restricted Zone B",
      camera: "CAM-12",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-25 09:26",
      alarmTriggered: true,
    },
    {
      id: 203,
      snapshot: "https://picsum.photos/400/200?random=13",
      zone: "Restricted Zone C",
      camera: "CAM-13",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-25 09:41",
      alarmTriggered: true,
    },
  ];

  const recentEmployeeViolations = backendEmployeePresenceData.map((item) => {
    return {
      voilation: item.alarmTriggered
        ? "Employee presence detected"
        : "No violation",
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
    };
  });
  const zoneViolationsData = [
    {
      zone: "Restricted Zone A",
      violations: 1,
    },
    {
      zone: "Restricted Zone B",
      violations: 1,
    },
    {
      zone: "Restricted Zone C",
      violations: 1,
    },
  ];
  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = employeeRestrictedPresenceKpiData.map(
    (kpi) => ({
      icon: kpi.icon,
      value: kpi.value,
      label: kpi.title,
      tone: /zone|time/i.test(kpi.title) ? "info" : "red",
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
    setViewPopupData(row as EmployeePresenceViolation);
    setViewPopupOpen(true);
  };

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
          {/* Active Critical Zone Personnel */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Violations"
              violations={recentEmployeeViolations}
              loading={false}
              tooltipMessage="Latest 20 violations where employee entred in restricted areas with details."
            />
          </Grid>
          {/* Critical Zones Status */}
          {/* item xs={12} lg={4} */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows  employee entred in restricted zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/* Employee Presence Report */}
      <ReportTable
        title="Detailed Report"
        columns={[
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 140 },
          { id: "zone", label: "Zone", minWidth: 150 },

          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
        ]}
        data={recentEmployeeViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentEmployeeViolations.map((v) => v.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentEmployeeViolations.map((v) => v.cameraId)),
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
        downloadFileName="employee-presence-restricted-report"
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        loading={false}
        totalCount={0}
        page={0}
        rowsPerPage={0}
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

export default EmployeePresenceRestrictedAreaPage;
