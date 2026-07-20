"use client";

import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import { Block, CheckCircle, LocationOn } from "@mui/icons-material";

import CarIcon from "@mui/icons-material/DirectionsCar";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const UnauthorizedParkingOrEquipmentBlockingAisles: React.FC = () => {
  interface UnauthorizedParkingEvent {
    eventMessage: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;
    updatedAt: string;
    [key: string]: string | number | boolean;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<UnauthorizedParkingEvent | null>(null);
  const backendData = [
    {
      id: 201,
      typeOf: "Car",
      snapshot: "/img/unauthorised-parking-blocking-aisles/p2.jpg",
      zone: "Zone A",
      camera: "CAM-11",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 08:45",
    },
    {
      id: 202,
      typeOf: "Car",
      snapshot: "/img/unauthorised-parking-blocking-aisles/p1.jpg",
      zone: "Zone B",
      camera: "CAM-12",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 09:18",
    },
    {
      id: 203,
      typeOf: "Car",
      snapshot: "/img/unauthorised-parking-blocking-aisles/p3.jpg",
      zone: "Zone C",
      camera: "CAM-13",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 10:08",
    },
  ];

  const recentViolations = backendData.map((item) => {
    const eventMessage =
      item.typeOf === "Car"
        ? "Unauthorized Car Parking"
        : "Equipment Blocking Aisle";

    return {
      eventMessage,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.camera,
      alarmTriggered: true,
      updatedAt: item.updatedAt,
    };
  });

  console.log(recentViolations);

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from backendData so the totals always match the recent
  // violations list and the report table.
  const zoneCounts = backendData.reduce((acc, item) => {
    acc[item.zone] = (acc[item.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const zoneViolationsData = Object.entries(zoneCounts).map(
    ([zone, violations]) => ({
      zone,
      violations,
      subViolations: [{ label: "Car", value: violations, icon: CarIcon }],
    }),
  );

  const affectedZones = Array.from(
    new Set(backendData.map((item) => item.zone)),
  ).slice(-3);

  const UnauthorizedParkingKpiData = [
    {
      title: "Blocked Parking",
      value: String(backendData.length),
      tooltipMessage:
        "Shows the total number of parking that are currently blocked.",
      icon: Block,
    },
    {
      title: "Clear Parking",
      value: "1",
      tooltipMessage:
        "Shows the total number of parking that are currently clear and safe for use.",
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
        "Displays the last three zones where blocked parking were detected.",
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

  const handleDownloadSingle = () => {
    console.log("download single row");
  };
  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    const violation = row as UnauthorizedParkingEvent;
    setViewPopupData(violation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = UnauthorizedParkingKpiData.map(
    (kpi) => ({
      icon: kpi.icon,
      value: kpi.value,
      label: kpi.title,
      tone: /zone|time|incidence/i.test(kpi.title) ? "info" : "red",
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
              onRangeChange={() => console.log("on range chnaged")}
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
              tooltipMessage="Latest 20 unauthorized parking or equipment blocking with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows unauthorized parking or equipment blocking per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        totalCount={recentViolations.length}
        page={0}
        rowsPerPage={10}
        title="Detailed Report"
        tooltipMessage="Detailed report of unauthorized parking and equipment blocking aisles"
        columns={[
          { id: "eventMessage", label: "Voilation", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 150 },
          { id: "zone", label: "Zone", minWidth: 120 },

          { id: "cameraId", label: "Camera", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered" },
        ]}
        data={recentViolations}
        filters={[
          {
            id: "eventMessage",
            label: "Voilation",
            type: "select",
            options: Array.from(
              new Set(recentViolations.map((v) => v.eventMessage)),
            ),
          },

          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(new Set(recentViolations.map((v) => v.zone))),
          },
          {
            id: "cameraId",
            label: "Camera",
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
          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        downloadFileName="unauthorized-parking-report"
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        onExport={handleExport}
        loading={false}
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

export default UnauthorizedParkingOrEquipmentBlockingAisles;
