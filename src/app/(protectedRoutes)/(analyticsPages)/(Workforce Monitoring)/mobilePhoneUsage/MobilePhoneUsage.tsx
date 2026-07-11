"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { PhoneIphone, LocationOn, AccessTime } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const MobilePhoneUsage: React.FC = () => {
  interface ViolationData {
    voilation: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;
    alarmTriggered: boolean;
    [key: string]: string | number | boolean;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<ViolationData | null>(
    null,
  );
  const MobilePhoneUsageKpiData = [
    {
      title: "Total Violations",
      value: "3",
      icon: PhoneIphone,
      trendColor: "#f44336",
      color: "#f44336",
      bgColor: "#ffebee",
      borderColor: "#f44336",
      iconBg: "rgba(244, 67, 54, 0.1)",

      tooltipMessage:
        "Total number of mobile phone usage violations detected in restricted areas.",
    },
    {
      title: "Latest Incidence",
      value: getOneHourBefore().time,
      icon: AccessTime,
      tooltipMessage:
        "The time when the most recent mobile phone usage violation was detected.",
    },
    {
      title: "Zone Detection",
      value: "Zone A",
      icon: LocationOn,
      tooltipMessage:
        "The zone where the latest mobile phone usage violation was detected.",
    },
  ];
  const backendMobilePhoneData = [
    {
      id: 201,
      voilation: true,
      snapshot: "/img/mobile-usage-restricted-zones/m1.avif",
      zone: "Zone A",
      cameraid: "CAM-11",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:43",
    },
    {
      id: 202,
      voilation: true,
      snapshot: "/img/mobile-usage-restricted-zones/m2.jpg",
      zone: "Zone B",
      cameraid: "CAM-12",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 16:51",
    },
    {
      id: 203,
      voilation: true,
      snapshot: "/img/mobile-usage-restricted-zones/m3.png",
      zone: "Zone C",
      cameraid: "CAM-13",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 17:06",
    },
    {
      id: 204,
      voilation: true,
      snapshot: "https://picsum.photos/400/200?random=14",
      zone: "Main Entrance",
      cameraid: "CAM-14",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 17:21",
    },
    {
      id: 205,
      voilation: true,
      snapshot: "https://picsum.photos/400/200?random=15",
      zone: "Parking Area",
      cameraid: "CAM-15",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-09-23 17:36",
    },
  ];

  // Map backend data to recentViolations format
  const recentMobilePhoneViolations = backendMobilePhoneData.map((item) => {
    return {
      voilation: item.voilation
        ? "Mobile phone usage detected"
        : "No violation",
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.cameraid,
      alarmTriggered: item.alarmTriggered,
    };
  });

  console.log("Recent Mobile Phone Violations", recentMobilePhoneViolations);

  const zoneViolationsData = [
    {
      zone: "Zone A",
      violations: 1,
    },
    {
      zone: "Zone B",
      violations: 1,
    },
    {
      zone: "Zone C",
      violations: 1,
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
  const handleViewSingle = (row: Record<string, string | number | boolean>) => {
    console.log("view single row", row);
    setViewPopupData(row as ViolationData);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = MobilePhoneUsageKpiData.map((kpi) => ({
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
              violations={recentMobilePhoneViolations}
              tooltipMessage="Latest 20 detected mobile phone usage violations with details."
              loading={false}
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsData}
              loading={false}
              tooltipMessage="Shows mobile phone usage violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        title="Detailed Report"
        columns={[
          { id: "voilation", label: "Violation", minWidth: 150 },
          { id: "time", label: "Time", minWidth: 140 },
          { id: "zone", label: "Zone", minWidth: 120 },
          { id: "cameraId", label: "Cameras", minWidth: 120 },

          { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
        ]}
        data={recentMobilePhoneViolations}
        filters={[
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentMobilePhoneViolations.map((v) => v.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentMobilePhoneViolations.map((v) => v.cameraId)),
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
        downloadFileName="mobile-phone-usage-report"
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        loading={false}
        onView={handleViewSingle}
        tooltipMessage="Detailed mobile phone usage  report with filter, reset, and CSV/PDF download options."
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

export default MobilePhoneUsage;
