"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import { AccessTime, LocationOn, Security } from "@mui/icons-material";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

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

  const backendSleepingSecurityData = [
    {
      id: 901,
      sleeping: true,
      absence: false,
      snapshot: "/img/sleeping-absence-security-guards/s2.avif",
      zone: "Gate 2",
      camera: "CAM-51",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-24 08:17",
    },
    {
      id: 902,
      sleeping: false,
      absence: true,
      snapshot: "/img/sleeping-absence-security-guards/s1.jpg",
      zone: "Gate 1",
      camera: "CAM-52",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-24 08:27",
    },
    {
      id: 901,
      sleeping: true,
      absence: false,
      snapshot: "/img/sleeping-absence-security-guards/s2.avif",
      zone: "Main Gate",
      camera: "CAM-51",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-24 08:17",
    },
    {
      id: 902,
      sleeping: false,
      absence: true,
      snapshot: "/img/sleeping-absence-security-guards/s1.jpg",
      zone: "Assembly Line A",
      camera: "CAM-52",
      createdAt: getOneHourBefore().fullDate,
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

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from backendSleepingSecurityData so the totals always match the
  // recent violations list and the report table.
  const zoneTotals = backendSleepingSecurityData.reduce((acc, item) => {
    if (!acc[item.zone]) {
      acc[item.zone] = { zone: item.zone, sleeping: 0, absence: 0 };
    }
    if (item.sleeping) acc[item.zone].sleeping += 1;
    if (item.absence) acc[item.zone].absence += 1;
    return acc;
  }, {} as Record<string, { zone: string; sleeping: number; absence: number }>);

  const zoneViolationsData = Object.values(zoneTotals).map(
    ({ zone, sleeping, absence }) => ({
      zone,
      violations: sleeping + absence,
      subViolations: [
        { label: "Sleeping", value: sleeping, icon: HotelIcon },
        { label: "Absence", value: absence, icon: PersonOffIcon },
      ],
    }),
  );

  const violatedZones = Object.keys(zoneTotals);

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
      value: getOneHourBefore().time,
      icon: AccessTime,
      tooltipMessage:
        "Displays the time of the most recent incident involving security personnel.",
    },
    {
      title: "Zone Violations",
      value: violatedZones.join(", "),
      icon: LocationOn,
      tooltipMessage:
        "Lists the zones where sleeping security personnel violations were detected.",
    },
  ];

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = SleepingSecurityPersonnelKpiData.map(
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
    setViewPopupData(row as SleepingSecurityViolation);
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
              // Floor, not a fixed height: ViolationsTrend always has data (static
              // placeholder) and must stay readable even when ViolationBreakdown
              // has zero metrics and would otherwise collapse the row via flex-stretch.
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

export default SleepingSecurityPersonnel;
