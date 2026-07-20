"use client";

import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { AccessTime, Shield, Security, LocationOn } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
import { getOneHourBefore } from "@/utils/getOneHrBefore";

const IntrusionDetection: React.FC = () => {
  interface IntrusionViolation {
    incident: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;
    id: number;
    [key: string]: string | number | boolean;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<IntrusionViolation | null>(
    null,
  );
  const intrusionKpiData = [
    {
      title: "Intrusion Detected",
      value: "4",
      icon: Security,
      tooltipMessage: "Shows the total number of intrusions detected so far.",
    },
    {
      title: "Security Level (Safe/Unsafe)",
      value: "Unsafe",
      tooltipMessage:
        "Displays whether the security status is safe or unsafe at the moment.",

      icon: Shield,
    },
    {
      title: "Recent Intrusion Time",
      value: getOneHourBefore().time,
      icon: AccessTime,

      tooltipMessage:
        "Shows the time when the most recent intrusion was detected.",
    },
    {
      title: "Zone Breaches",
      value: "4 (Perimeter Fence, Warehouse Gate,Assembly shop floor, Internal secure storage)",
      icon: LocationOn,
      tooltipMessage:
        "Displays the number of zones breached and lists those zones.",
    },
  ];
  const backendIntrusionData = [
    {
      id: 201,
      snapshot: "/img/intrusion-detection-perimeter/i1.png",
      zone: "Perimeter Fence",
      camera: "CAM-1",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 18:06",
    },
    {
      id: 202,
      snapshot: "/img/intrusion-detection-perimeter/i2.png",
      zone: "Warehouse Gate",
      camera: "CAM-2",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 18:16",
    },
    {
      id: 203,
      snapshot: "/img/intrusion-detection-perimeter/i3.png",
      zone: "Assembly shop floor",
      camera: "CAM-3",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 18:06",
    },
    {
      id: 204,
      snapshot: "/img/intrusion-detection-perimeter/i4.png",
      zone: "Internal secure storage",
      camera: "CAM-4",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 18:16",
    },
  ];

  const recentIntrusionViolations = backendIntrusionData.map((item) => {
    let incidentMsg = "";

    if (item.alarmTriggered) {
      incidentMsg = "Intrusion detected";
    } else {
      incidentMsg = "No violation";
    }

    return {
      incident: incidentMsg,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
      id: item.id,
    };
  });

  // Single source of truth: derived from backendIntrusionData so the zone
  // breakdown always matches the recent-violations/report rows instead of
  // a hardcoded, disconnected placeholder.
  const zoneCounts = backendIntrusionData.reduce((acc, item) => {
    acc[item.zone] = (acc[item.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const zoneViolationsData = Object.entries(zoneCounts).map(
    ([zone, violations]) => ({ zone, violations })
  );
  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    console.log("view single row", row);
    setViewPopupData(row as IntrusionViolation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = intrusionKpiData.map((kpi) => ({
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
          {/* Active Intrusion Alerts */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Incident"
              violations={recentIntrusionViolations}
              loading={false}
              tooltipMessage="Latest 20 intrusion detected with details."
            />
          </Grid>
          {/* Security Zones Status */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Zone Incident"
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows intrusion detected per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Security Intrusion Report */}
      <ReportTable
        title="Detailed Report"
        columns={[
          { id: "incident", label: "Incident", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 150 },
          { id: "zone", label: "Zone", minWidth: 150 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
        ]}
        data={recentIntrusionViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentIntrusionViolations.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentIntrusionViolations.map((v) => v.cameraId)),
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
        downloadFileName="intrusion-detection-report"
        loading={false}
        onView={handleViewSingle}
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        totalCount={0}
        page={0}
        rowsPerPage={0}
      />
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

export default IntrusionDetection;
