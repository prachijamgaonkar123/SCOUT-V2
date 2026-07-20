"use client";

import React, { useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolation";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { getOneHourBefore } from "@/utils/getOneHrBefore";
import ViolationBreakdown, {
  BreakdownMetric,
} from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

const MonitoringCanteenUsageTimings: React.FC = () => {
  interface CanteenUsage {
    usage: string;
    count: number;
    zone: string;
    imageUrl: string;
    time: string;
    [key: string]: string | number | boolean;
  }
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<CanteenUsage | null>(null);
  const backendData = [
    {
      id: 201,
      usage: "Breakfast",
      count: 50,
      zone: "Main Canteen",
      snapshot: "/img/canteen-usage-monitoring/c1.avif",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 08:20",
    },
    {
      id: 202,
      usage: "Lunch",
      count: 80,
      zone: "Main Canteen",
      snapshot: "/img/canteen-usage-monitoring/c2.jpg",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 12:35",
    },
    {
      id: 203,
      usage: "Dinner",
      count: 35,
      zone: "Night Shift Canteen",
      snapshot: "/img/canteen-usage-monitoring/c1.avif",
      createdAt: getOneHourBefore().fullDate,
      updatedAt: "2025-10-09 20:10",
    },
  ];
  const recentCanteenUsage = backendData.map((item) => {
    return {
      usage: item.usage,
      count: item.count,
      zone: item.zone,
      time: item.createdAt,
      imageUrl: item.snapshot,
    };
  });

  // Single source of truth: every KPI and the zone breakdown below is
  // derived from backendData so the totals always match the recent usage
  // list and the report table.
  const zoneUsageTotals = backendData.reduce((acc, item) => {
    if (!acc[item.zone]) {
      acc[item.zone] = { zone: item.zone, Breakfast: 0, Lunch: 0, Dinner: 0 };
    }
    acc[item.zone][item.usage as "Breakfast" | "Lunch" | "Dinner"] +=
      item.count;
    return acc;
  }, {} as Record<string, { zone: string; Breakfast: number; Lunch: number; Dinner: number }>);

  const zoneUsageData = Object.values(zoneUsageTotals).map(
    ({ zone, Breakfast, Lunch, Dinner }) => ({
      zone,
      totalUsage: Breakfast + Lunch + Dinner,
      subViolations: [
        { label: "Breakfast", value: Breakfast, icon: FreeBreakfastIcon },
        { label: "Lunch", value: Lunch, icon: LunchDiningIcon },
        { label: "Dinner", value: Dinner, icon: DinnerDiningIcon },
      ],
    }),
  );

  const breakfastTotal = backendData
    .filter((item) => item.usage === "Breakfast")
    .reduce((sum, item) => sum + item.count, 0);
  const lunchTotal = backendData
    .filter((item) => item.usage === "Lunch")
    .reduce((sum, item) => sum + item.count, 0);
  const dinnerTotal = backendData
    .filter((item) => item.usage === "Dinner")
    .reduce((sum, item) => sum + item.count, 0);

  const canteenKpiCards = [
    {
      title: "Breakfast Usage",
      value: String(breakfastTotal),
      icon: FreeBreakfastIcon,
      tooltipMessage: "Total number of breakfasts served.",
    },
    {
      title: "Lunch Usage",
      value: String(lunchTotal),
      icon: LunchDiningIcon,
      tooltipMessage: "Total number of lunches served.",
    },
    {
      title: "Dinner Usage",
      value: String(dinnerTotal),
      icon: DinnerDiningIcon,
      tooltipMessage: "Total number of dinners served.",
    },
    {
      title: "Total Canteen Usage",
      value: String(breakfastTotal + lunchTotal + dinnerTotal),
      icon: RestaurantIcon,
      tooltipMessage: "Total meals served in the canteen.",
    },
    {
      title: "Last Canteen Usage",
      value: getOneHourBefore().time,
      icon: AccessTimeIcon,
      tooltipMessage: "Most recent canteen usage record.",
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
    setViewPopupData(row as CanteenUsage);
    setViewPopupOpen(true);
  };

  // Location/time metrics get the "info" tint; violation counts get red — matches PPE.
  const breakdownMetrics: BreakdownMetric[] = canteenKpiCards.map((kpi) => ({
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
              label="Recent Canteen Usage"
              violations={recentCanteenUsage}
              loading={false}
              tooltipMessage="recent voilation"
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Canteen Usage"
              violationsZone={zoneUsageData}
              loading={false}
              tooltipMessage="Shows canteen usage per zone"
            />
          </Grid>
        </Grid>
      </Paper>
      {/* Violations Report */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed canteen usage report with filters and export options."
        columns={[
          { id: "usage", label: "Canteen Usage" },
          { id: "count", label: "Count" },
          { id: "time", label: "Time" },
          { id: "zone", label: "Zone" },
        ]}
        data={recentCanteenUsage}
        filters={[
          {
            id: "usage",
            label: "Usage Type",
            type: "select",
            options: Array.from(
              new Set(recentCanteenUsage.map((v) => v.usage)),
            ),
          },
          {
            id: "zone",
            label: "Zone",
            type: "select",
            options: Array.from(new Set(recentCanteenUsage.map((v) => v.zone))),
          },

          { id: "time", label: "Start Date", type: "date" },
          { id: "time", label: "End Date", type: "date" },
        ]}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownloadSingle}
        onView={handleViewSingle}
        downloadFileName="canteen-usage-report"
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

export default MonitoringCanteenUsageTimings;
