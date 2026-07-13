"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Box, Grid, Paper } from "@mui/material";
import {
  Shield,
  Visibility,
  LocationOn,
  AccessTime,
  Checkroom,
} from "@mui/icons-material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { SvgIconComponent } from "@mui/icons-material";

// UI Components
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
import { getOneHourBefore } from "@/utils/getOneHrBefore";

// ---------- TYPES ----------
// Base type that matches the component's Violation (all fields optional)
type BaseViolation = {
  violation?: string;
  zone?: string;
  time?: string;
  imageUrl?: string;
};

// Our internal type makes all fields required and adds extra fields
interface PPEViolation extends BaseViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  cameraId: string;
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}

// ZoneViolation with index signature to match ZoneViolationsdata
interface ZoneViolation {
  zone: string;
  violations: number;
  subViolations: ZoneViolationSub[];
  [key: string]: string | number | ZoneViolationSub[];
}

interface ZoneViolationSub {
  label: string;
  value: number;
  icon: SvgIconComponent;
}

interface FilterParams {
  violation?: string;
  zone?: string;
  cameraId?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

// ---------- STATIC DATA ----------
const ppeKpiData = [
  {
    title: "Total Violations",
    value: "5",
    icon: Shield,
    tooltipMessage:
      "Total number of PPE violations detected across all monitored zones.",
  },
  {
    title: "Current Unsafe Zone",
    value: "2",
    icon: LocationOn,
    tooltipMessage:
      "Number of zones where unsafe PPE compliance was detected.",
  },
  {
    title: "Last Detection Time",
    value: new Date().toLocaleString(),
    icon: AccessTime,
    tooltipMessage: "The time when the last PPE violation was detected.",
  },
  {
    title: "Missing Helmet",
    value: "4",
    icon: EngineeringIcon,
    tooltipMessage:
      "Number of detected instances where workers were missing helmets.",
  },
  {
    title: "Missing Vest",
    value: "1",
    icon: Checkroom,
    tooltipMessage:
      "Number of detected instances where workers were missing safety vests.",
  },
  {
    title: "Missing Glasses",
    value: "4",
    icon: Visibility,
    tooltipMessage:
      "Number of detected instances where workers were missing safety glasses.",
  },
];

const rawRecentViolations = [
  {
    id: 101,
    helmet: false,
    vest: true,
    glasses: false,
    zone: "Zone A",
    snapshot: "/img/p1.jpg",
    cameraid: "CAM-01",
    alarmTriggered: true,
    createdAt: getOneHourBefore().fullDate,
  },
  {
    id: 102,
    helmet: true,
    vest: false,
    glasses: false,
    zone: "Zone B",
    snapshot: "/img/p2.png",
    cameraid: "CAM-02",
    alarmTriggered: true,
    createdAt: getOneHourBefore().fullDate,
  },
  {
    id: 103,
    helmet: false,
    vest: true,
    glasses: false,
    zone: "Zone A",
    snapshot: "/img/p3.avif",
    cameraid: "CAM-03",
    alarmTriggered: true,
    createdAt: getOneHourBefore().fullDate,
  },
  {
    id: 104,
    helmet: false,
    vest: true,
    glasses: false,
    zone: "Zone A",
    snapshot: "/img/p2.png",
    cameraid: "CAM-04",
    alarmTriggered: false,
    createdAt: getOneHourBefore().fullDate,
  },
  {
    id: 105,
    helmet: false,
    vest: true,
    glasses: true,
    zone: "Zone B",
    snapshot: "/img/p1.jpg",
    cameraid: "CAM-05",
    alarmTriggered: true,
    createdAt: getOneHourBefore().fullDate,
  },
];

const recentViolations: PPEViolation[] = rawRecentViolations.map((item) => {
  const parts = [];
  if (!item.helmet) parts.push("Hard hat missing");
  if (!item.vest) parts.push("Safety vest not worn");
  if (!item.glasses) parts.push("Safety glasses missing");
  return {
    violation: parts.join(", ") || "No violation",
    zone: item.zone,
    time: item.createdAt,
    imageUrl: item.snapshot,
    cameraId: item.cameraid,
    alarmTriggered: item.alarmTriggered,
  };
});

const zoneViolationsData: ZoneViolation[] = [
  {
    zone: "Zone A",
    violations: 7,
    subViolations: [
      { label: "Helmet", value: 4, icon: EngineeringIcon },
      { label: "Glasses", value: 3, icon: VisibilityOffIcon },
    ],
  },
  {
    zone: "Zone B",
    violations: 3,
    subViolations: [
      { label: "Helmet", value: 1, icon: EngineeringIcon },
      { label: "Glasses", value: 1, icon: VisibilityOffIcon },
      { label: "Vest", value: 1, icon: CheckroomIcon },
    ],
  },
 {
    zone: "Zone c",
    violations: 7,
    subViolations: [
      { label: "Helmet", value: 4, icon: EngineeringIcon },
      { label: "Glasses", value: 3, icon: VisibilityOffIcon },
    ],
  },
  {
    zone: "Zone d",
    violations: 3,
    subViolations: [
      { label: "Helmet", value: 1, icon: EngineeringIcon },
      { label: "Glasses", value: 1, icon: VisibilityOffIcon },
      { label: "Vest", value: 1, icon: CheckroomIcon },
    ],
  },
 
];

// ---------- COMPONENT ----------
const PPEDetection: React.FC = () => {
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<PPEViolation | null>(null);

  // Metrics for ViolationBreakdown
  const breakdownMetrics: BreakdownMetric[] = useMemo(() => {
    const titleTone: Record<string, "red" | "info"> = {
      "Total Violations": "red",
      "Current Unsafe Zone": "info",
      "Last Detection Time": "info",
      "Missing Helmet": "red",
      "Missing Vest": "red",
      "Missing Glasses": "red",
    };
    const valueFontSize: Record<string, number> = {
      "Last Detection Time": 13,
    };

    return ppeKpiData.map((kpi) => ({
      icon: kpi.icon,
      value: kpi.value,
      label: kpi.title,
      tone: titleTone[kpi.title] || "red",
      valueFontSize: valueFontSize[kpi.title],
    }));
  }, []);

  // Dummy trend data
  const violationsTrendData = useMemo(() => {
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
  }, []);

  const zoneViolationsForUi = useMemo(() => zoneViolationsData, []);

  // Table configuration
  const tableColumns = [
    { id: "violation", label: "Violation" },
    { id: "time", label: "Time" },
    { id: "zone", label: "Zone" },
    { id: "cameraId", label: "Cameras" },
    { id: "alarmTriggered", label: "Alarm Triggered" },
  ];

  const tableFilters = [
    {
      id: "violation",
      label: "Violation",
      type: "select" as const,
      options: [
        "Hard hat missing",
        "Safety vest not worn",
        "Safety glasses missing",
      ],
    },
    {
      id: "zone",
      label: "Zone",
      type: "select" as const,
      options: Array.from(new Set(recentViolations.map((v) => v.zone))),
    },
    {
      id: "cameraId",
      label: "Cameras",
      type: "select" as const,
      options: Array.from(new Set(recentViolations.map((v) => v.cameraId))),
    },
    {
      id: "alarmTriggered",
      label: "Alarm Triggered",
      type: "select" as const,
      options: ["True", "False"],
    },
    { id: "startDate", label: "Start Date", type: "date" as const },
    { id: "endDate", label: "End Date", type: "date" as const },
  ];

  // Handlers
  const handleTimeRangeChange = useCallback(
    (range: { start?: string; end?: string }) => {
      console.log("Time range changed (static mode):", range);
    },
    []
  );

  const handleSubmitFilter = useCallback(async (filters: FilterParams) => {
    console.log("Filters submitted (static mode):", filters);
  }, []);

  const handleReset = useCallback(() => {
    console.log("Filters reset (static mode)");
  }, []);

  const handleExport = useCallback(
    async (format: "csv" | "pdf", filters: FilterParams) => {
      console.log(`Export ${format} with filters:`, filters);
      const fileName = `ppe-report.${format}`;
      const link = document.createElement("a");
      link.href = `/reports/${fileName}`;
      link.download = fileName;
      link.click();
    },
    []
  );

  const handleDownloadSingle = useCallback(
    async (row: PPEViolation, index: number) => {
      console.log("Download single row:", row);
      const fileName = `ppe-single-report.pdf`;
      const link = document.createElement("a");
      link.href = `/reports/${fileName}`;
      link.download = fileName;
      link.click();
    },
    []
  );

  const handleViewSingle = useCallback((row: PPEViolation) => {
    console.log("View single row:", row);
    setViewPopupData(row);
    setViewPopupOpen(true);
  }, []);

  // Handler for RecentViolations: accepts BaseViolation (matches component's Violation)
  const handleDownloadViolation = useCallback(
    async (url: string, violation: BaseViolation) => {
      // Cast to PPEViolation because our data always has the extra fields
      const ppeViolation = violation as PPEViolation;
      console.log("Download violation from popup:", url, ppeViolation);
      const fileName = `ppe-single-report.pdf`;
      const link = document.createElement("a");
      link.href = `/reports/${fileName}`;
      link.download = fileName;
      link.click();
    },
    []
  );

  return (
    <Box>
      <Paper sx={{ p: 3, backgroundColor: "#fff", borderRadius: 2 }}>
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
              boxShadow:
                "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
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
                borderLeft: {
                  xs: "none",
                  md: `1px solid ${DASHBOARD_COLORS.border}`,
                },
                borderTop: {
                  xs: `1px solid ${DASHBOARD_COLORS.border}`,
                  md: "none",
                },
              }}
            >
              <ViolationsTrend data={violationsTrendData} trendPercentage={18} />
            </Box>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <CollapsibleTimeFilter onRangeChange={handleTimeRangeChange} />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Violations"
              violations={recentViolations} // direct, no cast needed
              loading={false}
              tooltipMessage="Latest 20 detected PPE violations"
              onDownload={handleDownloadViolation}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Zone Violations"
              violationsZone={zoneViolationsForUi}
              loading={false}
              tooltipMessage="Shows PPE violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      <ReportTable
        totalCount={recentViolations.length}
        page={0}
        rowsPerPage={10}
        title="Detailed Report"
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        data={recentViolations as unknown as Record<string, string | number | boolean>[]}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={(row, index) =>
          handleDownloadSingle(row as unknown as PPEViolation, index)
        }
        exportLoading={false}
        downloadingRows={new Set<number>()}
        onView={(row) => handleViewSingle(row as unknown as PPEViolation)}
        downloadFileName="ppe-violations-report"
        loading={false}
      />

      <ViewAlertPopup
        open={viewPopupOpen}
        handleClose={() => setViewPopupOpen(false)}
        details={
          viewPopupData as unknown as Record<
            string,
            string | number | boolean | undefined
          >
        }
        imageKey="imageUrl"
        onDownload={(url) => {
          if (viewPopupData) {
            handleDownloadViolation(url, viewPopupData);
          }
        }}
      />
    </Box>
  );
};

export default PPEDetection;