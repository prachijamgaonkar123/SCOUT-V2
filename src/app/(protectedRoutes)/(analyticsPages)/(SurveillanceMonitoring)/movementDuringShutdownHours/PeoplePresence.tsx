"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { Groups, LocationOn, AccessTime } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import PeopleIcon from "@mui/icons-material/People";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
const PeoplePresence: React.FC = () => {
  interface PeoplePresenceViolation {
    incident: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    peopleCount: number;
    alarmTriggered: boolean;
    [key: string]: string | number | boolean;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<PeoplePresenceViolation | null>(null);

  const backendPeoplePresenceData = [
    {
      id: 801,
      snapshot: "/img/movement-shutdown-hours/m1.jpg",
      zone: "Zone A",
      camera: "CAM-31",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:06",
    },
    {
      id: 802,
      snapshot: "/img/movement-shutdown-hours/m2.jpg",
      zone: "Zone B",
      camera: "CAM-32",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:16",
    },
    {
      id: 801,
      snapshot: "/img/movement-shutdown-hours/u2.jpg",
      zone: "Zone C",
      camera: "CAM-31",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:06",
    },
    {
      id: 802,
      snapshot: "/img/movement-shutdown-hours/u1.jpg",
      zone: "Zone D",
      camera: "CAM-32",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:16",
    },
    {
      id: 801,
      snapshot: "/img/movement-shutdown-hours/m2.jpg",
      zone: "Zone B",
      camera: "CAM-31",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:06",
    },
    {
      id: 802,
      snapshot: "/img/movement-shutdown-hours/u3.jpg",
      zone: "Zone E",
      camera: "CAM-32",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:16",
    },
    {
      id: 801,
      snapshot: "/img/movement-shutdown-hours/m1.jpg",
      zone: "Zone A",
      camera: "CAM-31",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:06",
    },
    {
      id: 802,
      snapshot: "/img/movement-shutdown-hours/u2.jpg",
      zone: "Loading Dock",
      camera: "CAM-32",
      count: 7,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:16",
    },
    {
      id: 801,
      snapshot: "/img/movement-shutdown-hours/m2.jpg",
      zone: "Production Floor",
      camera: "CAM-31",
      count: 15,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:06",
    },
    {
      id: 802,
      snapshot: "/img/movement-shutdown-hours/u2.jpg",
      zone: "Loading Dock",
      camera: "CAM-32",
      count: 7,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:16",
    },
    {
      id: 801,
      snapshot: "/img/movement-shutdown-hours/m2.jpg",
      zone: "Production Floor",
      camera: "CAM-31",
      count: 15,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:06",
    },
    {
      id: 802,
      snapshot: "/img/movement-shutdown-hours/u2.jpg",
      zone: "Loading Dock",
      camera: "CAM-32",
      count: 7,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:16",
    },
    {
      id: 801,
      snapshot: "/img/movement-shutdown-hours/m2.jpg",
      zone: "Production Floor",
      camera: "CAM-31",
      count: 15,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:06",
    },
    {
      id: 802,
      snapshot: "/img/movement-shutdown-hours/u1.jpg",
      zone: "Zone D",
      camera: "CAM-32",
      count: 1,
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 21:16",
    },
  ];

  const recentPeoplePresence = backendPeoplePresenceData.map((item) => {
    const incidentMsg = `People detected: ${item.count}`;

    return {
      incident: incidentMsg,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      peopleCount: item.count,
      alarmTriggered: item.alarmTriggered,
    };
  });

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from backendPeoplePresenceData so the totals always match the
  // recent incidents list and the report table.
  const zoneEventCounts = backendPeoplePresenceData.reduce((acc, item) => {
    acc[item.zone] = (acc[item.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const zoneViolationsData = Object.entries(zoneEventCounts).map(
    ([zone, peopleCount]) => ({
      zone,
      violations: peopleCount,
      icons: {
        peopleCount: PeopleIcon,
      },
    }),
  );

  const detectedZones = Array.from(
    new Set(backendPeoplePresenceData.map((item) => item.zone)),
  );

  const PeoplePresenceKpiData = [
    {
      title: "Total Movement Events",
      value: String(backendPeoplePresenceData.length),
      icon: Groups,
      tooltipMessage:
        "Shows the total number of movement events detected in monitored zones.",
    },
    {
      title: "Detected Zones",
      value: detectedZones.join(", "),
      icon: LocationOn,
      tooltipMessage: "Lists the zones where movement is currently detected.",
    },
    {
      title: "Last Incidence",
      value: getOneHourBefore().time,
      icon: AccessTime,
      tooltipMessage:
        "Shows the time when the most recent movement event was detected.",
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
    setViewPopupData(row as PeoplePresenceViolation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = PeoplePresenceKpiData.map((kpi) => ({
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
              label="Recent Incident"
              violations={recentPeoplePresence}
              loading={false}
              tooltipMessage="Latest 20 people detection during shutdown hours with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Zone Incident"
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows people presence during shutdown hours incidents per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Violations Report */}
      <ReportTable
        title="Detailed Report"
        columns={[
          { id: "incident", label: "Incident", minWidth: 200 },
          { id: "peopleCount", label: "People Count", minWidth: 120 },
          { id: "time", label: "Time", minWidth: 150 },
          { id: "zone", label: "Zone", minWidth: 150 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
        ]}
        data={recentPeoplePresence}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentPeoplePresence.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Camera",
            type: "select",
            options: Array.from(
              new Set(recentPeoplePresence.map((item) => item.cameraId)),
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
        downloadFileName="people-presence-shutdown-report"
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        loading={false}
        onView={handleViewSingle}
        tooltipMessage="Detailed incidents report with filter, reset, and CSV/PDF download options."
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

export default PeoplePresence;
