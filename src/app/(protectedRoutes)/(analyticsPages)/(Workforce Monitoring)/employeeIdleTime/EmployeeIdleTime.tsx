"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import { AccessTime, Room } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const EmployeeIdleTime: React.FC = () => {
  interface EmployeeIdleEvent {
    incident: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;

    [key: string]: string | number | boolean;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<EmployeeIdleEvent | null>(
    null,
  );
  // Exactly 1 idle, 1 working, 1 not-present record — keeps Recent Incident (3
  // tiles), Zone Incident (1/1/1 breakdown), and Violation Breakdown's
  // "Total Idle Events" (1) all showing the same underlying counts.
  const backendIdleData = [
    {
      id: 301,
      isIdle: true,
      isWorking: false,
      notPresent: false,
      trackingId: "TRK-01",
      zone: "Zone A",
      snapshot: "/img/employee-idle-time-monitoring/idle.png",
      cameraid: "CAM-I01",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 14:55",
    },
    {
      id: 302,
      isIdle: false,
      isWorking: true,
      notPresent: false,
      trackingId: "TRK-02",
      zone: "Zone B",
      snapshot: "/img/employee-idle-time-monitoring/working.png",
      cameraid: "CAM-I02",
      createdAt: "2025-10-08 14:45",
      updatedAt: "2025-10-08 14:45",
    },
    {
      id: 304,
      isIdle: false,
      isWorking: false,
      notPresent: true,
      trackingId: "TRK-04",
      zone: "Assembly Line B",
      snapshot: "/img/employee-idle-time-monitoring/i2.jpg",
      cameraid: "CAM-I04",
      createdAt: "2025-10-08 14:20",
      updatedAt: "2025-10-08 14:25",
    },
  ];

  const recentIdleEvents = backendIdleData.map((item) => {
    const titleParts = [];

    if (item.isIdle) titleParts.push("Employee Idle");
    if (item.isWorking) titleParts.push("Employee Working");
    if (item.notPresent) titleParts.push("Employee Not Present");

    return {
      incident: titleParts.join(", ") ?? "No event",
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.cameraid,
    };
  });

  console.log("RECENT IDLE EVENTS", recentIdleEvents);

  // Recent Incident card shows only the latest 3 records (no scroll needed).
  const recentIdleEventsForCard = recentIdleEvents.slice(0, 3);

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from backendIdleData so the totals always match the recent
  // events list and the report table.
  const zoneIdleTotals = backendIdleData.reduce((acc, item) => {
    if (!acc[item.zone]) {
      acc[item.zone] = { zone: item.zone, idle: 0, working: 0, notPresent: 0 };
    }
    if (item.isIdle) acc[item.zone].idle += 1;
    if (item.isWorking) acc[item.zone].working += 1;
    if (item.notPresent) acc[item.zone].notPresent += 1;
    return acc;
  }, {} as Record<string, { zone: string; idle: number; working: number; notPresent: number }>);

  const zoneIdleData = Object.values(zoneIdleTotals).map(
    ({ zone, idle, working, notPresent }) => ({
      zone,
      // Total badge = count of all events in this zone (idle+working+notPresent),
      // so each zone's total matches its actual record count (1 event = total 1).
      // NOTE: key must be "violations" — ZoneViolations reads zone.violations
      // for its total badge; the old "incidents" key was never read at all.
      violations: idle + working + notPresent,
      subViolations: [
        { label: "Idle", value: idle, icon: AccessTimeIcon },
        { label: "Working", value: working, icon: WorkOutlineIcon },
        { label: "Not Present", value: notPresent, icon: PersonOffIcon },
      ],
    }),
  );

  const totalIdleEvents = backendIdleData.filter((item) => item.isIdle).length;

  const lastIdleRecord = [...backendIdleData]
    .filter((item) => item.isIdle)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))[0];

  const EmployeeIdleTimeKpiData = [
    {
      title: "Total Idle Events",
      value: String(totalIdleEvents),
      icon: AccessTime,
      tooltipMessage:
        "Total number of idle time events detected by the system.",
    },
    {
      title: "Last Idle Detection Time",
      value: getOneHourBefore().time,
      icon: AccessTime,
      tooltipMessage: "The most recent idle detection timestamp.",
    },
    {
      title: "Last Idle Detection Zone",
      value: lastIdleRecord?.zone ?? "N/A",
      icon: Room,
      tooltipMessage: "The zone where the most recent idle event was detected.",
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
    console.log("view single row", row);
    setViewPopupData(row as EmployeeIdleEvent);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = EmployeeIdleTimeKpiData.map((kpi) => ({
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
          {/* Recent Violations */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              tooltipMessage="Latest 3 detected idle, working, not present employee events with details."
              label="Recent Incident"
              violations={recentIdleEventsForCard}
              loading={false}
            />
          </Grid>
          {/* PPE Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneIdleData}
              loading={false}
              tooltipMessage="Shows idel, working,not present employee per zone"
              label="Zone Incident"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed idle time events report with filter, reset, and CSV/PDF download options."
        columns={[
          { id: "incident", label: "Incident" },
          { id: "time", label: "Time" },
          { id: "zone", label: "Zone" },
          { id: "cameraId", label: "Cameras" },
        ]}
        data={recentIdleEvents}
        filters={[
          {
            id: "incident",
            label: "Incident",
            type: "select",
            options: Array.from(
              new Set(recentIdleEvents.map((v) => v.incident)),
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(new Set(recentIdleEvents.map((v) => v.zone))),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentIdleEvents.map((v) => v.cameraId)),
            ),
          },

          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        downloadFileName="employee-idle-time-report"
        loading={false}
        totalCount={recentIdleEvents.length}
        page={0}
        rowsPerPage={0}
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

export default EmployeeIdleTime;
