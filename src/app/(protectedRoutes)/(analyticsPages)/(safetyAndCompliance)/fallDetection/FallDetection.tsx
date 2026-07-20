"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import {
  CheckCircle,
  Schedule,
  ReportProblem,
  Whatshot,
} from "@mui/icons-material";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
import { getOneHourBefore } from "@/utils/getOneHrBefore";

const FallDetection: React.FC = () => {
  interface RecentViolationData {
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
    useState<RecentViolationData | null>(null);

  const backendLaydownData = [
    {
      id: 401,
      snapshot: "/img/fall-detections/fall1.png",
      zone: "Production Floor A",
      camera: "CAM-11",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 18:06",
      alarmTriggered: true,
    },
    {
      id: 402,
      snapshot: "/img/fall-detections/fall2.png",
      zone: "Warehouse",
      camera: "CAM-12",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 18:13",
      alarmTriggered: false,
    },
    {
      id: 404,
      snapshot: "/img/fall-detections/fall3.png",
      zone: "Production Floor A",
      camera: "CAM-11",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 18:06",
      alarmTriggered: true,
    },
   
    
  ];

  // Map backend data to recentViolations format
  const recentLaydownViolations = backendLaydownData.map((item) => {
    return {
      voilation: "Fall / Laydown detected",
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
    };
  });

  console.log("laydown recent voilation", recentLaydownViolations);

  // Single source of truth: grouped straight from backendLaydownData so the
  // zone breakdown, the "most incident-prone zone" KPI, and the total KPI
  // always agree with the recent-violations/report rows.
  const zoneCounts = backendLaydownData.reduce((acc, item) => {
    acc[item.zone] = (acc[item.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const zoneViolationsData = Object.entries(zoneCounts).map(
    ([zone, violations]) => ({ zone, violations })
  );

  const mostIncidentProneZone = zoneViolationsData.reduce((max, curr) =>
    curr.violations > max.violations ? curr : max
  );

  const fallKpiData = [
    {
      title: "Total Fall Incidents",
      value: String(backendLaydownData.length),
      icon: ReportProblem,
      tooltipMessage:
        "Total number of fall, laydown, or sleeping incidents detected across all monitored zones.",
    },

    {
      title: "Incident-Free Zones",
      value: "2 / 5",
      icon: CheckCircle,
      tooltipMessage:
        "Number of zones without any fall or laydown incidents out of the total monitored zones.",
    },
    {
      title: "Last Detection Time",
      value: getOneHourBefore().time,
      icon: Schedule,
      tooltipMessage:
        "The time when the most recent fall, laydown, or sleeping incident was detected.",
    },
    {
      title: "Most Incident-Prone Zone",
      value: mostIncidentProneZone.zone,
      icon: Whatshot,
      tooltipMessage:
        "The zone with the highest number of fall, laydown, or sleeping incidents recorded.",
      trendColor: "#f44336",
      color: "#f44336",
      bgColor: "#ffebee",
      borderColor: "#f44336",
      iconBg: "rgba(244, 67, 54, 0.1)",
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
  };

  const handleReset = () => {
    console.log("reset button clickedd");
  };

  const handleExport = (format: "csv" | "pdf") => {
    console.log("Export requested clikcedd:", format);
  };

  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    console.log("view single row", row);
    setViewPopupData(row as RecentViolationData);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = fallKpiData.map((kpi) => ({
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
              violations={recentLaydownViolations}
              loading={false}
              tooltipMessage="Latest 20 detected laydown/sleeping/falldown violations with details."
            />
          </Grid>
          {/* Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows laydown/sleeping/falldown violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Report */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        columns={[
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 120 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 120 },
        ]}
        data={recentLaydownViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentLaydownViolations.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentLaydownViolations.map((item) => item.cameraId)),
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
        onView={handleViewSingle}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        downloadFileName="ppe-violations-report"
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

export default FallDetection;
