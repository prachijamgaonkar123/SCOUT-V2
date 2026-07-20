"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import {
  Groups,
  ReportProblem,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";
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

const CrowdGathering: React.FC = () => {
  interface ViolationRow {
    voilation: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;
    mobCount: number;
    [key: string]: string | number | boolean;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<ViolationRow | null>(null);
  const backendCrowdData = [
    {
      id: 701,
      gatheredMore: true,
      alarmTriggered: true,
      mobCount: 25,
      snapshot: "img/crowd/c1.png",
      zone: "Hazard Zone A",
      camera: "CAM-21",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 20:06",
    },
    {
      id: 702,
      gatheredMore: true,
      alarmTriggered: false,
      mobCount: 12,
      snapshot: "img/crowd/c2.png",
      zone: "Hazard Zone B",
      camera: "CAM-22",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 20:16",
    },
    {
      id: 703,
      gatheredMore: true,
      alarmTriggered: true,
      mobCount: 25,
      snapshot: "img/crowd/c3.png",
      zone: "Hazard Zone A",
      camera: "CAM-21",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 20:06",
    },
    {
      id: 704,
      gatheredMore: true,
      alarmTriggered: true,
      mobCount: 30,
      snapshot: "img/crowd/c1.png",
      zone: "Cafeteria Zone",
      camera: "CAM-23",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 20:26",
    },
    {
      id: 705,
      gatheredMore: true,
      alarmTriggered: false,
      mobCount: 18,
      snapshot: "img/crowd/c2.png",
      zone: "Loading Dock Zone",
      camera: "CAM-24",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 20:36",
    },

  ];

  const recentCrowdViolations = backendCrowdData.map((item) => {
    let violationMsg = "";

    if (item.gatheredMore) {
      violationMsg = `Crowd gathering detected `;
    } else {
      violationMsg = "No violation";
    }

    return {
      voilation: violationMsg,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: item.alarmTriggered,
      mobCount: item.mobCount,
    };
  });

  // Single source of truth: every KPI and the zone breakdown below is derived
  // from backendCrowdData so the totals always match the incident list.
  const zoneTotals = Object.values(
    backendCrowdData.reduce((acc, item) => {
      if (!acc[item.zone]) {
        acc[item.zone] = { zone: item.zone, count: 0, mobCount: 0 };
      }
      acc[item.zone].count += 1;
      acc[item.zone].mobCount += item.mobCount;
      return acc;
    }, {} as Record<string, { zone: string; count: number; mobCount: number }>)
  );

  const zoneViolationsData = zoneTotals.map(({ zone, count }) => ({
    zone,
    violations: count,
  }));

  const crowdedZone = [...zoneTotals].sort(
    (a, b) => b.mobCount - a.mobCount
  )[0];

  const peakRecord = [...backendCrowdData].sort(
    (a, b) => b.mobCount - a.mobCount
  )[0];

  const CrowdKpiData = [
    {
      title: "Total Incidents Detected",
      value: String(backendCrowdData.length),
      icon: ReportProblem,
      tooltipMessage:
        "Shows the total number of crowd gathering incidents detected so far.",
    },
    {
      title: "Crowded Zone",
      value: crowdedZone.zone,
      icon: Groups,
      tooltipMessage:
        "Displays the zone that currently has the highest crowd gathering.",
    },

    {
      title: "Peak Crowd Density ",
      value: `${peakRecord.mobCount} (${peakRecord.zone})`,
      icon: LocationOn,
      tooltipMessage:
        "Shows the highest recorded crowd density along with the zone where it occurred.",
      trendColor: "#f44336",
      color: "#f44336",
      bgColor: "#ffebee",
      borderColor: "#f44336",
      iconBg: "rgba(244, 67, 54, 0.1)",
    },
    {
      title: "Last Incidence",
      value: getOneHourBefore().time,
      icon: AccessTime,
      tooltipMessage:
        "Displays the timestamp of the most recent crowd gathering incident detected.",
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
    setViewPopupData(row as ViolationRow); // or PPEViolation
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = CrowdKpiData.map((kpi) => ({
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
          backgroundColor: DASHBOARD_COLORS.card,
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
              violations={recentCrowdViolations}
              loading={false}
              tooltipMessage="Latest 20 detected crowd gathering violations with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows crowd gathered event per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Violations Report */}
      <ReportTable
        title="Detailed Report"
        columns={[
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "mobCount", label: "People Count", minWidth: 120 },
          { id: "time", label: "Time", minWidth: 150 },
          { id: "zone", label: "Zone", minWidth: 150 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
        ]}
        data={recentCrowdViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentCrowdViolations.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentCrowdViolations.map((item) => item.cameraId)),
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
        downloadFileName="crowd-gathering-report"
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

export default CrowdGathering;
