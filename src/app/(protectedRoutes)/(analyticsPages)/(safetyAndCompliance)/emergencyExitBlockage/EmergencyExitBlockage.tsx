"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { Block, CheckCircle, LocationOn } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const EmergencyExitBlockage: React.FC = () => {
  interface ReportData extends Record<string, string | number | boolean> {
    voilation: string;
    zone: string;
    time: string;
    cameraId: string;
    imageUrl: string;
    alarmTriggered: boolean;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<ReportData | null>(null);

  const backendExitBlockageData = [
    {
      id: 501,
      blockage: true,
      alarmTriggered: true,
      snapshot: "/img/emergency-exit-blockage-detection/E1.png",
      zone: "Emergency Exit A",
      camera: "CAM-14",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 19:06",
    },

    {
      id: 503,
      blockage: true,
      alarmTriggered: true,
      snapshot: "/img/emergency-exit-blockage-detection/E2.png",
      zone: "Assembly Line Exit",
      camera: "CAM-16",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 19:21",
    },
    {
      id: 504,
      blockage: true,
      alarmTriggered: true,
      snapshot: "/img/emergency-exit-blockage-detection/E3.png",
      zone: "Emergency Exit A",
      camera: "CAM-14",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 19:06",
    },
    {
      id: 505,
      blockage: true,
      alarmTriggered: true,
      snapshot: "/img/emergency-exit-blockage-detection/E1.png",
      zone: "Warehouse Exit B",
      camera: "CAM-18",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 19:32",
    },
    {
      id: 506,
      blockage: true,
      alarmTriggered: false,
      snapshot: "/img/emergency-exit-blockage-detection/E2.png",
      zone: "Loading Dock Exit C",
      camera: "CAM-20",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 19:45",
    }

  ];

  // Map backend data to recentViolations format
  const recentExitBlockageViolations: ReportData[] =
    backendExitBlockageData.map((item) => {
      const titleParts = [];

      if (item.blockage === true) titleParts.push("Emergency exit blocked");

      return {
        voilation: titleParts.join(", ") ?? "No violation",
        zone: item.zone,
        time: item.createdAt,
        imageUrl: item.snapshot,
        cameraId: item.camera,
        alarmTriggered: item.alarmTriggered,
      };
    });

  console.log(
    "emergency exit bolockage voilation",
    recentExitBlockageViolations,
  );

  // Single source of truth: grouped straight from backendExitBlockageData so
  // the zone breakdown always sums to the same total as the KPI card and the
  // recent-violations/report rows.
  const zoneCounts = backendExitBlockageData.reduce((acc, item) => {
    acc[item.zone] = (acc[item.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const zoneViolationsData = Object.entries(zoneCounts).map(
    ([zone, BlockedExit]) => ({ zone, violations: BlockedExit })
  );

  const affectedZones = Array.from(
    new Set(backendExitBlockageData.map((item) => item.zone))
  ).slice(-3);

  const ExitKpiData = [
    {
      title: "Blocked Emergency Exit",
      value: String(backendExitBlockageData.length),
      tooltipMessage:
        "Shows the total number of emergency exits that are currently blocked.",
      icon: Block,
    },
    {
      title: "Clear Emergency Exit Routes",
      value: "12",
      tooltipMessage:
        "Shows the total number of emergency exits that are currently clear and safe for use.",
      icon: CheckCircle,
      trendColor: "#4caf50",
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      iconBg: "rgba(76, 175, 80, 0.1)",
    },
    {
      title: "Affected Zones (Last 3)",
      value: affectedZones.join(", "),
      tooltipMessage:
        "Displays the last three zones where blocked emergency exits were detected.",
      icon: LocationOn,
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
    console.log("view single row", row);
    setViewPopupData(row as ReportData);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = ExitKpiData.map((kpi) => ({
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
              label="Recent Violations"
              violations={recentExitBlockageViolations}
              loading={false}
              tooltipMessage="Latest 20 detected emergency exit blockage with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows emergency exit blockage per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Violations Report */}
      <ReportTable
        title="Detailed Report"
        columns={[
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 120 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 120 },
        ]}
        data={recentExitBlockageViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentExitBlockageViolations.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(
                recentExitBlockageViolations.map((item) => item.cameraId),
              ),
            ),
          },
          {
            id: "alarmTriggered",
            label: "Alarm Triggered",
            type: "select",
            options: ["True", "False"],
          },
          { id: "startDate", label: "Start Date", type: "date" },
          { id: "endDate", label: "End Date", type: "date" },
        ]}
        downloadFileName="emergency-exit-blockage-report"
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        loading={false}
        onView={handleViewSingle}
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
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

export default EmergencyExitBlockage;
