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
import { truncate } from "fs";

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
// Single source of truth: rawRecentViolations below drives the KPI cards,
// the zone breakdown, the recent violations list, and the report table, so
// all four views always agree on the same numbers.
const rawRecentViolations = [
  {
    id: 101,
    helmet: false,
    vest: true,
    goggles: true,
    zone: "Zone A",
    snapshot: "/img/ppe-kit-detection/no-helmet.png",
    cameraid: "CAM-01",
    alarmTriggered: true,
    createdAt: getOneHourBefore().fullDate,
  },
  {
    id: 102,
    helmet: true,
    vest: true,
    goggles: false,
    zone: "Zone B",
    snapshot: "/img/ppe-kit-detection/no-goggle.png",
    cameraid: "CAM-02",
    alarmTriggered: true,
    createdAt: getOneHourBefore().fullDate,
  },
  {
    id: 103,
    helmet: true,
    vest: false,
    goggles: true,
    zone: "Zone A",
    snapshot: "/img/ppe-kit-detection/no-vest.png",
    cameraid: "CAM-03",
    alarmTriggered: true,
    createdAt: getOneHourBefore().fullDate,
  },
  // {
  //   id: 104,
  //   helmet: false,
  //   vest: true,
  //   goggles: false,
  //   zone: "Zone A",
  //   snapshot: "/img/ppe-kit-detection/helmet-goggles-missing-2.png",
  //   cameraid: "CAM-04",
  //   alarmTriggered: false,
  //   createdAt: getOneHourBefore().fullDate,
  // },
  // {
  //   id: 105,
  //   helmet: false,
  //   vest: true,
  //   goggles: true,
  //   zone: "Zone B",
  //   snapshot: "/img/p2.png",
  //   cameraid: "CAM-05",
  //   alarmTriggered: true,
  //   createdAt: getOneHourBefore().fullDate,
  // },
];

const recentViolations: PPEViolation[] = rawRecentViolations.map((item) => {
  const parts = [];
  if (!item.helmet) parts.push("Hard hat missing");
  if (!item.vest) parts.push("Safety vest not worn");
  if (!item.goggles) parts.push("Safety goggles missing");
  return {
    violation: parts.join(", ") || "No violation",
    zone: item.zone,
    time: item.createdAt,
    imageUrl: item.snapshot,
    cameraId: item.cameraid,
    alarmTriggered: item.alarmTriggered,
  };
});

// Grouped straight from rawRecentViolations so per-zone missing-item counts,
// the zone "violations" total, and the KPI totals below always add up.
const zoneTotals = rawRecentViolations.reduce((acc, item) => {
  if (!acc[item.zone]) {
    acc[item.zone] = { zone: item.zone, helmet: 0, vest: 0, goggles: 0 };
  }
  if (!item.helmet) acc[item.zone].helmet += 1;
  if (!item.vest) acc[item.zone].vest += 1;
  if (!item.goggles) acc[item.zone].goggles += 1;
  return acc;
}, {} as Record<string, { zone: string; helmet: number; vest: number; goggles: number }>);

const zoneViolationsData: ZoneViolation[] = Object.values(zoneTotals).map(
  ({ zone, helmet, vest, goggles }) => ({
    zone,
    violations: helmet + vest + goggles,
    subViolations: [
      { label: "Helmet", value: helmet, icon: EngineeringIcon },
      { label: "Vest", value: vest, icon: CheckroomIcon },
      { label: "Goggles", value: goggles, icon: VisibilityOffIcon },
    ].filter((sub) => sub.value > 0),
  })
);

const missingHelmetCount = rawRecentViolations.filter((v) => !v.helmet).length;
const missingVestCount = rawRecentViolations.filter((v) => !v.vest).length;
const missingGogglesCount = rawRecentViolations.filter(
  (v) => !v.goggles
).length;
const unsafeZoneCount = Object.keys(zoneTotals).length;

// "Total Violations" is every individual PPE violation instance (a single
// worker can be missing more than one item at once), so it must equal the
// sum of the per-item counts below — the same sum the zone breakdown totals
// to — not just the number of incident rows.
const totalViolationsCount =
  missingHelmetCount + missingVestCount + missingGogglesCount;

const ppeKpiData = [
  {
    title: "Total Violations",
    value: String(totalViolationsCount),
    icon: Shield,
    tooltipMessage:
      "Total number of PPE violations detected across all monitored zones.",
  },
  {
    title: "Current Unsafe Zone",
    value: String(unsafeZoneCount),
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
    value: String(missingHelmetCount),
    icon: EngineeringIcon,
    tooltipMessage:
      "Number of detected instances where workers were missing helmets.",
  },
  {
    title: "Missing Vest",
    value: String(missingVestCount),
    icon: Checkroom,
    tooltipMessage:
      "Number of detected instances where workers were missing safety vests.",
  },
  {
    title: "Missing Goggles",
    value: String(missingGogglesCount),
    icon: Visibility,
    tooltipMessage:
      "Number of detected instances where workers were missing safety goggles.",
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
      "Missing Goggles": "red",
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
        "Safety goggles missing",
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