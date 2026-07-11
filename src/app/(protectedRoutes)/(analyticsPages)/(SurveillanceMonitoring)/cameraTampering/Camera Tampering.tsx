"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import { Warning, Room } from "@mui/icons-material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
const CameraTampering: React.FC = () => {
  interface CameraTamperingViolation {
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
    useState<CameraTamperingViolation | null>(null);

  const CameraTamperingKpiData = [
    {
      title: "Total Offline Cameras",
      value: "2",
      tooltipMessage:
        "Shows the total number of offline cameras currently monitored in the system.",
      icon: VideocamOffIcon,
    },
    {
      title: "Total Tampred Cameras",
      value: "4",
      tooltipMessage: "The total number of tampered detected cameras .",
      icon: Warning,
    },
    {
      title: "Offline Camera Zone",
      value: "Zone B",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
      icon: Room,
      tooltipMessage:
        "The  zone where the most recent offline cameras occurred.",
    },
    {
      title: "Tampred Camera Zone",
      value: "Zone C",
      trendColor: "#2196f3",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      iconBg: "rgba(33, 150, 243, 0.1)",
      icon: Room,
      tooltipMessage:
        "The  zone where the most recent tampred cameras occurred.",
    },
  ];

  const backendData = [
    {
      id: 201,
      tamperingType: "Lens Covered",
      zone: "Zone C",
      snapshot: "/img/camera-tampering-detection/lenseCover.png",
      cameraid: "CAM-T01",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
    },
    {
      id: 202,
      tamperingType: "Blur Vision",
      zone: "Zone A",
      snapshot: "/img/camera-tampering-detection/blur.jpg",
      cameraid: "CAM-T02",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
    },
    {
      id: 203,
      tamperingType: "Disconnected",
      zone: "Chemical Storage",
      snapshot: "https://picsum.photos/400/200?random=13",
      cameraid: "CAM-T03",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
    },
    {
      id: 204,
      tamperingType: "Offline",
      zone: "Zone B",
      snapshot: "/img/camera-tampering-detection/offline.jpg",
      cameraid: "CAM-T04",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
    },
    {
      id: 205,
      tamperingType: "Lens Covered",
      zone: "Zone C",
      snapshot: "/img/camera-tampering-detection/lenseCover.png",
      cameraid: "CAM-T05",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
    },
    {
      id: 202,
      tamperingType: "Blur Vision",
      zone: "Welding Station",
      snapshot: "https://picsum.photos/400/200?random=12",
      cameraid: "CAM-T02",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
    },
    {
      id: 203,
      tamperingType: "Disconnected",
      zone: "Chemical Storage",
      snapshot: "https://picsum.photos/400/200?random=13",
      cameraid: "CAM-T03",
      alarmTriggered: true,
      createdAt: getOneHourBefore().fullDate,
    },
    {
      id: 204,
      tamperingType: "Offline",
      zone: "Assembly Line B",
      snapshot: "https://picsum.photos/400/200?random=14",
      cameraid: "CAM-T04",
      alarmTriggered: false,
      createdAt: getOneHourBefore().fullDate,
    },
  ];

  const recentTamperingEvents = backendData.map((item) => {
    return {
      voilation: item.tamperingType ?? "No tampering",
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.cameraid,
      alarmTriggered: item.alarmTriggered,
    };
  });

  console.log("RECENT TAMPERING DATA", recentTamperingEvents);

  const zoneTamperingData = [
    {
      zone: "Zone A",
      violations: 2,
      subViolations: [
        { label: "Blur Vision", value: 2, icon: VisibilityOffIcon },
      ],
    },
    {
      zone: "Zone B",
      violations: 2,
      subViolations: [{ label: "Offline", value: 2, icon: Warning }],
    },
    {
      zone: "Zone C",
      violations: 2,
      subViolations: [
        { label: "Lens Obstructed", value: 2, icon: VisibilityOffIcon },
      ],
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
    setViewPopupData(row as CameraTamperingViolation);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = CameraTamperingKpiData.map((kpi) => ({
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
              tooltipMessage="Latest 20 detected camera temparing event with details."
              label="Recent Violations"
              violations={recentTamperingEvents}
              loading={false}
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneTamperingData}
              loading={false}
              tooltipMessage="Shows offline,tampered cameras per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed camera tampering/offline detection report with filter, reset, and CSV/PDF download options."
        columns={[
          { id: "voilation", label: "Violation" },
          { id: "time", label: "Time" },
          { id: "zone", label: "Zone" },
          { id: "cameraId", label: "Cameras" },
          { id: "alarmTriggered", label: "Alarm Triggered" },
        ]}
        data={recentTamperingEvents}
        filters={[
          {
            id: "voilation",
            label: "Violation",
            type: "select",
            options: Array.from(
              new Set(recentTamperingEvents.map((v) => v.voilation)),
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(
              new Set(recentTamperingEvents.map((v) => v.zone)),
            ),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentTamperingEvents.map((v) => v.cameraId)),
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
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        downloadFileName="camera-tampering-report"
        loading={false}
        totalCount={0}
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

export default CameraTampering;
