"use client";

import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { People, Login, Logout } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const PeopleCount: React.FC = () => {
  interface PeopleCountViolation {
    voilation: string;
    enteredCount: number;
    exitCount: number;
    time: string;
    zone: string;
    cameraId: string;
    alarmTriggered: boolean;
    imageUrl: string;

    [key: string]: string | number | boolean;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<PeopleCountViolation | null>(null);
  const backendData = [
    {
      id: 201,
      enteredCount: 4,
      exitCount: 0,
      zone: "Zone A",
      snapshot: "/img/people-count-factory-premises/p1.jpg",
      cameraid: "CAM-11",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-30 09:45",
    },
    {
      id: 202,
      enteredCount: 5,
      exitCount: 0,
      zone: "Zone B",
      snapshot: "/img/people-count-factory-premises/p2.jpg",
      cameraid: "CAM-12",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-30 09:30",
    },
    {
      id: 203,
      // Was 0 entered / 16 exited, which alone pushed total exits above
      // total entries (36 vs 34) — nonsensical, since more people can't
      // leave the factory than were ever counted coming in.
      enteredCount: 6,
      exitCount: 4,
      zone: "Zone C",
      snapshot: "/img/people-count-factory-premises/p3.jpg",
      cameraid: "CAM-13",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-30 09:20",
    },
    {
      id: 204,
      enteredCount: 20,
      exitCount: 14,
      zone: "Assembly Line B",
      snapshot: "/img/people-count-factory-premises/p2.jpg",
      cameraid: "CAM-14",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-30 09:05",
    },
    {
      id: 205,
      enteredCount: 5,
      exitCount: 2,
      zone: "Maintenance Area",
      snapshot: "/img/people-count-factory-premises/p3.jpg",
      cameraid: "CAM-15",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-30 08:40",
    },
  ];

  // Single source of truth: the zone breakdown and every KPI below is
  // derived from backendData so the totals always match the recent
  // violations list and the report table.
  const zonePeopleCountData = backendData.map((item) => ({
    zone: item.zone,
    subViolations: [
      { label: "entered Count", value: item.enteredCount, icon: PeopleIcon },
      { label: "exit Count", value: item.exitCount, icon: ExitToAppIcon },
    ],
  }));

  const recentViolations = backendData.map((item) => {
    return {
      voilation: `People Count (Entry/Exit)`,
      enteredCount: item.enteredCount,
      exitCount: item.exitCount,
      time: item.createdAt,
      zone: item.zone,
      cameraId: item.cameraid,
      alarmTriggered: item.alarmTriggered,
      imageUrl: item.snapshot,
    };
  });

  const totalEntered = backendData.reduce((sum, item) => sum + item.enteredCount, 0);
  const totalExited = backendData.reduce((sum, item) => sum + item.exitCount, 0);

  const peopleCountKpiData = [
    {
      title: "People Inside",
      value: String(Math.max(0, totalEntered - totalExited)),
      icon: People,

      tooltipMessage: "Current number of people present inside the area.",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
    },
    {
      title: "Entry Count",
      value: String(totalEntered),
      icon: Login,

      tooltipMessage: "Total number of people who entered today.",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
    },
    {
      title: "Exit Count",
      value: String(totalExited),
      icon: Logout,
      tooltipMessage: "Total number of people who exited today.",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
    },
  ];
  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    console.log("view single row", row);
    setViewPopupData(row as PeopleCountViolation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = peopleCountKpiData.map((kpi) => ({
    icon: kpi.icon,
    value: kpi.value,
    label: kpi.title,
    tone: /zone|time/i.test(kpi.title) ? "info" : "red",
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
              violations={recentViolations}
              loading={false}
              tooltipMessage="Latest 20 People Count in Factory Premises based on Entry Exit person Count with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zonePeopleCountData}
              loading={false}
              tooltipMessage="Shows person entry and exit count per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/* People Count Report */}
      <ReportTable
        title="Detailed Report"
        columns={[
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "enteredCount", label: "Entered Count", minWidth: 140 },
          { id: "exitCount", label: "Exit Count", minWidth: 120 },
          { id: "time", label: "Time", minWidth: 120 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
        ]}
        data={recentViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(new Set(recentViolations.map((v) => v.zone))),
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
            options: ["True", "False"],
          },
          {
            id: "time",
            label: "Start Date",
            type: "date",
          },
          {
            id: "time",
            label: "End Date",
            type: "date",
          },
        ]}
        downloadFileName="people-count-report"
        loading={false}
        onView={handleViewSingle}
        tooltipMessage="Detailed person entry and exit  report with filter, reset, and CSV/PDF download options."
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
          onDownload={(imageUrl) => console.log("Download image:", imageUrl)}
        />
      )}
    </Box>
  );
};

export default PeopleCount;
