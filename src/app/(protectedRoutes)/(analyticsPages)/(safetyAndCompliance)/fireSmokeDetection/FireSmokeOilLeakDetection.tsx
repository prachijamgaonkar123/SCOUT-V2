"use client";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import {
  LocalFireDepartment,
  Air,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import { useState } from "react";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const FireSmokeOilLeakDetection: React.FC = () => {
  interface RecentViolationData {
    incident: string;
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
  const backendFireData = [
    {
      id: 201,
      detection: true,
      objectname: "fire",
      snapshot: "/img/fire-smoke/fire1.png",
      zone: "Production Floor A",
      camera: "CAM-06",
      timestamp: "2025-09-23 16:00",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:01",
    },
    {
      id: 202,
      detection: true,
      objectname: "smoke",
      snapshot: "/img/fire-smoke/smoke1.png",
      zone: "Welding Station",
      camera: "CAM-07",
      timestamp: "2025-09-23 16:10",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:12",
    },
    {
      id: 203,
      detection: true,
      objectname: "smoke",
      snapshot: "/img/fire-smoke/smoke2.png",
      zone: "Chemical Storage",
      camera: "CAM-08",
      timestamp: "2025-09-23 16:20",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:21",
    },
    {
      id: 202,
      detection: true,
      objectname: "fire",
      snapshot: "/img/fire-smoke/fire2.png",
      zone: "Welding Station",
      camera: "CAM-07",
      timestamp: "2025-09-23 16:10",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:12",
    },

    {
      id: 202,
      detection: true,
      objectname: "smoke",
      snapshot: "/img/fire-smoke/smoke3.png",
      zone: "Welding Station",
      camera: "CAM-07",
      timestamp: "2025-09-23 16:10",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:12",
    },

    {
      id: 203,
      detection: true,
      objectname: "smoke",
      snapshot: "/img/fire-smoke/smoke4.png",
      zone: "Chemical Storage",
      camera: "CAM-08",
      timestamp: "2025-09-23 16:20",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:21",
    },
    {
      id: 202,
      detection: true,
      objectname: "fire",
      snapshot: "/img/fire-smoke/fire3.png",
      zone: "Welding Station",
      camera: "CAM-07",
      timestamp: "2025-09-23 16:10",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:12",
    },
    {
      id: 203,
      detection: true,
      objectname: "smoke",
      snapshot: "/img/fire-smoke/smoke2.png",
      zone: "Chemical Storage",
      camera: "CAM-08",
      timestamp: "2025-09-23 16:20",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:21",
    },
  ];

  // Single source of truth: every derived view (KPIs, zone breakdown, recent
  // violations, report table) is computed from backendFireData so the numbers
  // always agree with each other.
  const recentFireViolations = backendFireData.map((item) => ({
    incident: `${
      item.objectname.charAt(0).toUpperCase() + item.objectname.slice(1)
    } detected`,
    zone: item.zone,
    time: item.createdAt,
    imageUrl: item.snapshot,
    cameraId: item.camera,
    alarmTriggered: item.alarmTriggered,
  }));

  const fireCount = backendFireData.filter(
    (item) => item.objectname === "fire"
  ).length;
  const smokeCount = backendFireData.filter(
    (item) => item.objectname === "smoke"
  ).length;

  // Most recent record, determined by the (fake) event timestamp rather than
  // createdAt, since createdAt is the same "now" for every seeded row.
  const lastDetection = [...backendFireData].sort((a, b) =>
    a.timestamp > b.timestamp ? -1 : 1
  )[0];

  const FireSmokeOilKpiData = [
    {
      title: "Fire Incidence",
      value: String(fireCount),
      icon: LocalFireDepartment,
      tooltipMessage:
        "Total number of fire detections recorded across all monitored zones.",
    },
    {
      title: "Smoke Incidence",
      value: String(smokeCount),
      icon: Air,
      tooltipMessage:
        "Total number of smoke detections recorded across all monitored zones.",
    },
    {
      title: "Last Detection Time",
      value: getOneHourBefore().time,
      icon: AccessTime,
      tooltipMessage:
        "The time when the last fire or smoke detection was recorded.",
    },
    {
      title: "Last Detection Zone",
      value: lastDetection.zone,
      icon: LocationOn,
      tooltipMessage:
        "The zone where the most recent fire or smoke detection occurred.",
    },
  ];

  // Grouped straight from backendFireData so per-zone fire/smoke counts and
  // the incident total always sum correctly.
  const zoneViolationsData = Object.values(
    backendFireData.reduce((acc, item) => {
      if (!acc[item.zone]) {
        acc[item.zone] = { zone: item.zone, fire: 0, smoke: 0 };
      }
      if (item.objectname === "fire") acc[item.zone].fire += 1;
      if (item.objectname === "smoke") acc[item.zone].smoke += 1;
      return acc;
    }, {} as Record<string, { zone: string; fire: number; smoke: number }>)
  ).map(({ zone, fire, smoke }) => ({
    zone,
    incident: fire + smoke,
    subViolations: [
      { label: "Fire", value: fire },
      { label: "Smoke", value: smoke },
    ],
  }));

  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    console.log("view single row", row);
    setViewPopupData(row as RecentViolationData);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = FireSmokeOilKpiData.map((kpi) => ({
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
              label="Recent Incident"
              violations={recentFireViolations}
              loading={false}
              tooltipMessage="Latest 20 detected fire & smoke incident with details."
            />
          </Grid>
          {/*  Zone violations */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Zone Incident"
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows fire & smoke incident per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Fire, Smoke, Oil and Gas Leak Detection Report */}

      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        columns={[
          { id: "incident", label: "Incident", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 120 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 120 },
        ]}
        data={recentFireViolations}
        filters={[
          {
            id: "incident",
            label: "Incident",
            type: "select",
            options: Array.from(
              new Set(recentFireViolations.map((v) => v.incident))
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentFireViolations.map((v) => v.zone))
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentFireViolations.map((v) => v.cameraId))
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
        downloadFileName="detection-report"
        loading={false}
        onView={handleViewSingle} totalCount={0} page={0} rowsPerPage={0}      />
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

export default FireSmokeOilLeakDetection;
