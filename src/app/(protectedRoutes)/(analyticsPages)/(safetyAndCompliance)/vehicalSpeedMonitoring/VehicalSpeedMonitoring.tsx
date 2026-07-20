"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { Speed, TrendingUp, LocationOn, AccessTime } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const VehicalSpeedMonitoring: React.FC = () => {
  interface VehicleViolation {
    voilation: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;
    vehicleType: string;
    vehicleNumber: string;
    [key: string]: string | number | boolean;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<VehicleViolation | null>(
    null,
  );
  const backendVehicleData = [
    {
      id: 301,
      speed: 65,
      vehicleType: "Truck",
      vehicleNumber: "MH12AB1234",
      zone: "Main Gate",
      camera: "CAM-09",
      snapshot: "/img/vehicle-count-anpr-gates/v1.jpg",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:05",
      updatedAt: "2025-09-23 17:06",
    },
    {
      id: 302,
      speed: 55,
      vehicleType: "Car",
      vehicleNumber: "MH14XY5678",
      zone: "Parking Lot",
      camera: "CAM-10",
      snapshot: "/img/vehicle-count-anpr-gates/v2.jpg",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:15",
      updatedAt: "2025-09-23 17:16",
    },
    {
      id: 301,
      speed: 65,
      vehicleType: "Truck",
      vehicleNumber: "MH12AB1234",
      zone: "Main Gate",
      camera: "CAM-09",
      snapshot: "/img/vehicle-count-anpr-gates/v3.png",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:05",
      updatedAt: "2025-09-23 17:06",
    },
    {
      id: 302,
      speed: 58,
      vehicleType: "Car",
      vehicleNumber: "MH14XY5678",
      zone: "Parking Lot",
      camera: "CAM-10",
      snapshot: "/img/vehicle-count-anpr-gates/v2.jpg",
      alarmTriggered: true,
      createdAt: "2025-09-23 17:15",
      updatedAt: "2025-09-23 17:16",
    },
  ];

  const recentVehicleViolations = backendVehicleData.map((item) => {
    let violationMsg = "";

    // Example rule: If speed > 40 inside premises, it’s a violation
    if (item.speed > 40) {
      violationMsg = `Overspeeding detected (${item.speed} km/h)`;
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
      vehicleType: item.vehicleType || "Unknown",
      vehicleNumber: item.vehicleNumber || "N/A",
    };
  });
  console.log("vehical speed voilation", recentVehicleViolations);

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from backendVehicleData so the totals always match the recent
  // violations list and the report table.
  const highestSpeedRecord = [...backendVehicleData].sort(
    (a, b) => b.speed - a.speed
  )[0];

  const lastDetectionRecord = [...backendVehicleData].sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1
  )[0];

  const VehicalSpeedMonitoringKpiData = [
    {
      title: "Speed Violation Count",
      value: String(backendVehicleData.length),
      icon: Speed,
      tooltipMessage:
        "Total number of detected vehicle speed violations inside the premises.",
    },
    {
      title: "Highest Speed Recorded",
      value: `${highestSpeedRecord.speed} km/h`,
      icon: TrendingUp,
      tooltipMessage:
        "The maximum speed recorded among all monitored vehicles.",
    },
    {
      title: "Highest Speed Violation Zone",
      value: highestSpeedRecord.zone,
      icon: LocationOn,
      tooltipMessage:
        "The zone where the highest vehicle speed violation was detected.",
    },
    {
      title: "Last Detection Time",
      value: lastDetectionRecord.createdAt,
      icon: AccessTime,
      tooltipMessage:
        "The time when the most recent vehicle speed violation was detected.",
    },
  ];

  const zoneCounts = backendVehicleData.reduce((acc, item) => {
    acc[item.zone] = (acc[item.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const zoneViolationsData = Object.entries(zoneCounts).map(
    ([zone, violations]) => ({ zone, violations })
  );

  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    console.log("view single row", row);
    setViewPopupData(row as VehicleViolation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = VehicalSpeedMonitoringKpiData.map(
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
      {/* KPI Cards */}
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
              violations={recentVehicleViolations}
              loading={false}
              tooltipMessage="Latest 20 vehical overspeeding detected with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows vehical overspeeding violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Report */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        columns={[
          { id: "voilation", label: "Violation", minWidth: 200 },
          { id: "time", label: "Time", minWidth: 150 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },
          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 150 },

          { id: "vehicleType", label: "Vehicle Type", minWidth: 120 },
          { id: "vehicleNumber", label: "Vehicle Number", minWidth: 150 },
        ]}
        data={recentVehicleViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentVehicleViolations.map((item) => item.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentVehicleViolations.map((v) => v.cameraId)),
            ),
          },
          {
            id: "alarmTriggered",
            label: "Alarm Triggered",
            type: "select",
            options: ["true", "false"],
          },
          {
            id: "vehicleType",
            label: "Vehicle Type",
            type: "select",
            options: Array.from(
              new Set(recentVehicleViolations.map((item) => item.vehicleType)),
            ),
          },
          {
            id: "vehicleNumber",
            label: "Vehicle Number",
            type: "select",
            options: Array.from(
              new Set(
                recentVehicleViolations.map((item) => item.vehicleNumber),
              ),
            ),
          },
          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        downloadFileName="vehicle-detection-report"
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

export default VehicalSpeedMonitoring;
