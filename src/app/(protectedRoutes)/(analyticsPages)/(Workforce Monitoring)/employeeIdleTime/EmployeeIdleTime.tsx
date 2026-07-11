"use client";
import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import { AccessTime, Room } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const EmployeeIdleTime: React.FC = () => {
  interface EmployeeIdleEvent {
    incident: string;
    zone: string;
    time: string;
    imageUrl: string;
    cameraId: string;

    [key: string]: string | number | boolean;
  }

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<EmployeeIdleEvent | null>(
    null,
  );
  const EmployeeIdleTimeKpiData = [
    {
      title: "Total Idle Events",
      value: "1",
      icon: AccessTime,
      tooltipMessage:
        "Total number of idle time events detected by the system.",
    },
    {
      title: "Last Idle Detection Time",
      value: getOneHourBefore().time,
      icon: AccessTime,
      tooltipMessage: "The most recent idle detection timestamp.",
    },
    {
      title: "Last Idle Detection Zone",
      value: "Zone A",
      icon: Room,
      tooltipMessage: "The zone where the most recent idle event was detected.",
    },
  ];
  const backendIdleData = [
    {
      id: 301,
      isIdle: true,
      isWorking: false,
      notPresent: false,
      trackingId: "TRK-01",
      zone: "Zone A",
      snapshot: "/img/employee-idle-time-monitoring/i1.png",
      cameraid: "CAM-I01",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 14:55",
    },
    {
      id: 302,
      isIdle: false,
      isWorking: true,
      notPresent: false,
      trackingId: "TRK-02",
      zone: "Zone B",
      snapshot: "/img/employee-idle-time-monitoring/i2.jpg",
      cameraid: "CAM-I02",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-08 14:45",
    },
    {
      id: 303,
      isIdle: true,
      isWorking: false,
      notPresent: false,
      trackingId: "TRK-03",
      zone: "Chemical Storage",
      snapshot: "https://picsum.photos/400/200?random=23",
      cameraid: "CAM-I03",
      createdAt: "2025-10-08 14:30",
      updatedAt: "2025-10-08 14:35",
    },
    {
      id: 304,
      isIdle: false,
      isWorking: false,
      notPresent: true,
      trackingId: "TRK-04",
      zone: "Assembly Line B",
      snapshot: "https://picsum.photos/400/200?random=24",
      cameraid: "CAM-I04",
      createdAt: "2025-10-08 14:20",
      updatedAt: "2025-10-08 14:25",
    },
    {
      id: 305,
      isIdle: true,
      isWorking: false,
      notPresent: false,
      trackingId: "TRK-05",
      zone: "Maintenance Area",
      snapshot: "https://picsum.photos/400/200?random=25",
      cameraid: "CAM-I05",
      createdAt: "2025-10-08 14:10",
      updatedAt: "2025-10-08 14:15",
    },
  ];

  const recentIdleEvents = backendIdleData.map((item) => {
    const titleParts = [];

    if (item.isIdle) titleParts.push("Employee Idle");
    if (item.isWorking) titleParts.push("Employee Working");
    if (item.notPresent) titleParts.push("Employee Not Present");

    return {
      incident: titleParts.join(", ") ?? "No event",
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
      cameraId: item.cameraid,
    };
  });

  console.log("RECENT IDLE EVENTS", recentIdleEvents);

  const zoneIdleData = [
    {
      zone: "Zone A",
      incidents: 1,
      subViolations: [
        { label: "Idle", value: 1, icon: AccessTimeIcon },
        { label: "Working", value: 0, icon: WorkOutlineIcon },
        { label: "Not Present", value: 0, icon: PersonOffIcon },
      ],
    },
    {
      zone: "Zone B",
      incidents: 1,
      subViolations: [
        { label: "Working", value: 1, icon: WorkOutlineIcon },
        { label: "Idle", value: 0, icon: AccessTimeIcon },
        { label: "Not Present", value: 0, icon: PersonOffIcon },
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
    setViewPopupData(row as EmployeeIdleEvent);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = EmployeeIdleTimeKpiData.map((kpi) => ({
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
              tooltipMessage="Latest 20 detected idel, working,not present employee with details."
              label="Recent Incident"
              violations={recentIdleEvents}
              loading={false}
            />
          </Grid>
          {/* PPE Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneIdleData}
              loading={false}
              tooltipMessage="Shows idel, working,not present employee per zone"
              label="Zone Incident"
            />
          </Grid>
        </Grid>
      </Paper>
      {/*  Violations Report */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed idle time events report with filter, reset, and CSV/PDF download options."
        columns={[
          { id: "incident", label: "Incident" },
          { id: "time", label: "Time" },
          { id: "zone", label: "Zone" },
          { id: "cameraId", label: "Cameras" },
        ]}
        data={recentIdleEvents}
        filters={[
          {
            id: "incident",
            label: "Incident",
            type: "select",
            options: Array.from(
              new Set(recentIdleEvents.map((v) => v.incident)),
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(new Set(recentIdleEvents.map((v) => v.zone))),
          },
          {
            id: "cameraId",
            label: "Cameras",
            type: "select",
            options: Array.from(
              new Set(recentIdleEvents.map((v) => v.cameraId)),
            ),
          },

          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        downloadFileName="employee-idle-time-report"
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

export default EmployeeIdleTime;
