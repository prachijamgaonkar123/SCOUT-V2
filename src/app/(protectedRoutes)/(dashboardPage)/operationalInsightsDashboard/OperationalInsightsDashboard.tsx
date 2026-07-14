


"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Grid, Paper } from "@mui/material";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import DashboardKpiCard from "@/app/components/molecules/MonitoringDashboardKpiCard/MonitoringDashboardKpiCard";
import DashboardTabs, { TabConfig } from "@/app/components/organisms/DashboardTabs/DashboardTabs";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import TimeLineAreaChart from "@/app/components/organisms/TimeScaleLineChart/TimeScaleLineChart"; // same chart WorkforceMonitoring uses
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { FEATURE } from "@/app/config/featureRegistry";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { OperationalInsightsConfig } from "./OperationalInsightsDashboardConfig";
import {
  OperationalInsightsDashboardResponse,
  OperationalInsightsSocketPayload,
  PeopleInsideGraphData,
  CanteenGraphData,
  ParkingGraphData,
} from "./OperationalInsightsDashboard.types";
import {
  useGetOrgShiftTimeDataQuery,
  useLazyGetOperationalDashboardDataQuery,
} from "./OperationalInsightsDashboardApi";
import Loader from "@/app/components/atoms/Loader/Loader";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

// ---------- MOCK DATA IMPORTS ----------
import {
  mockOperationalDashboardData,
  mockOperationalShifts,
} from "./Mockdata";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Entry/exit line-chart props from any use case sharing the People Inside
// envelope: { granularity, series[{ zone, color, data[{ date, time, entryCount, exitCount }] }] }.
// Reused by People Count, Vehicle Count & ANPR, and Vehicle Loading/Unloading.
function buildEntryExitProps(
  dashboardData: OperationalInsightsDashboardResponse[],
  title: string
) {
  const usecase = dashboardData.find((d) => d.title === title);
  const raw = usecase?.graphs?.data;
  const graphData =
    raw && !Array.isArray(raw) && "series" in raw
      ? (raw as PeopleInsideGraphData)
      : undefined;

  const rawData = graphData?.series[0]?.data ?? [];

  const series = [
    {
      label: "Entry Count",
      color: DASHBOARD_COLORS.primary,
      showMark: false,
      data: rawData.map((p) => p.entryCount),
    },
    {
      label: "Exit Count",
      color: DASHBOARD_COLORS.success,
      showMark: false,
      data: rawData.map((p) => p.exitCount),
    },
  ];

  const xAxisDates = rawData.map((p) => p.date);
  const xAxisTimes = rawData.map((p) => p.time);
  const granularity: PeopleInsideGraphData["granularity"] = graphData?.granularity ?? "hour";

  return { series, xAxisDates, xAxisTimes, granularity };
}

// Unauthorized Parking: one line per zone — { granularity, series[{ zone, color, data[{ date, time, count }] }] }
function buildParkingProps(dashboardData: OperationalInsightsDashboardResponse[]) {
  const usecase = dashboardData.find(
    (d) => d.title === "Unauthorized Parking / Blocking Aisles"
  );
  const raw = usecase?.graphs?.data;
  const graphData =
    raw && !Array.isArray(raw) && "series" in raw
      ? (raw as ParkingGraphData)
      : undefined;

  const series =
    graphData?.series.map((zone) => ({
      label: zone.zone,
      color: zone.color,
      showMark: false,
      data: zone.data.map((p) => p.count),
    })) ?? [];

  const firstZone = graphData?.series[0]?.data ?? [];
  const xAxisDates = firstZone.map((p) => p.date);
  const xAxisTimes = firstZone.map((p) => p.time);
  const granularity: ParkingGraphData["granularity"] = graphData?.granularity ?? "hour";

  return { series, xAxisDates, xAxisTimes, granularity };
}
// Canteen Usage Monitoring returns the same envelope shape as People Inside —
// { granularity, series[{ data[{ date, time, breakfastCount, lunchCount, dinnerCount }] }] } —
// just with meal-type counts instead of entry/exit counts, so it reuses TimeLineAreaChart directly.
function buildCanteenInsideProps(dashboardData: OperationalInsightsDashboardResponse[]) {
  const usecase = dashboardData.find((d) => d.title === "Canteen Usage Monitoring");
  const graphData = usecase?.graphs?.data as CanteenGraphData | undefined;
 
  const rawData = graphData?.series?.[0]?.data ?? [];
 
  const series = [
    {
      label: "Breakfast",
      color: DASHBOARD_COLORS.warning,
      showMark: false,
      data: rawData.map((p) => p.breakfastCount),
    },
    {
      label: "Lunch",
      color: DASHBOARD_COLORS.primary,
      showMark: false,
      data: rawData.map((p) => p.lunchCount),
    },
    {
      label: "Dinner",
      color: DASHBOARD_COLORS.workforce,
      showMark: false,
      data: rawData.map((p) => p.dinnerCount),
    },
  ];
 
  const xAxisDates = rawData.map((p) => p.date);
  const xAxisTimes = rawData.map((p) => p.time);
  const granularity: CanteenGraphData["granularity"] = graphData?.granularity ?? "hour";
 
  return { series, xAxisDates, xAxisTimes, granularity };
}
 

// ─── Component ────────────────────────────────────────────────────────────────
const OperationalInsightsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, features } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  const [isLiveMode, setIsLiveMode] = useState(true);
  const [dashboardData, setDashboardData] = useState<OperationalInsightsDashboardResponse[]>([]);

  // ── API ──────────────────────────────────────────────────────────────────
  const { data: orgShifts } = useGetOrgShiftTimeDataQuery(
    { tenantId },
    { skip: !tenantId || USE_MOCK } // 👈 Skip when mock mode is on
  );

  const [fetchOperationalKpi, { isFetching: operationalKpiLoading }] =
    useLazyGetOperationalDashboardDataQuery();

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return;

    if (USE_MOCK) {
      // 👈 Use static mock data
      setDashboardData(mockOperationalDashboardData);
      return;
    }

    fetchOperationalKpi({ tenantId })
      .unwrap()
      .then((data) => setDashboardData(data ?? []))
      .catch(console.error);
  }, [tenantId, fetchOperationalKpi]);

  // ── Socket (live mode) ────────────────────────────────────────────────────
  useSocketEvent<OperationalInsightsSocketPayload>({
    tenantId,
    enabled: isLiveMode && !USE_MOCK, // 👈 Disable socket in mock mode
    event: SOCKET_EVENTS.OPERATIONAL_INSIGHTS_UPDATE,
    handler: (payload) => {
      if (!payload?.data) return;
      setDashboardData(payload.data);
    },
  });

  // ── Time filter ───────────────────────────────────────────────────────────
  const handleTimeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (USE_MOCK) {
        // 👈 Return mock data (optionally filter by range if needed)
        setDashboardData(mockOperationalDashboardData);
        return;
      }

      if (!range.start && !range.end) {
        setIsLiveMode(true);
        const res = await fetchOperationalKpi({ tenantId }).unwrap();
        setDashboardData(res ?? []);
        return;
      }
      setIsLiveMode(false);
      const data = await fetchOperationalKpi({
        tenantId,
        startDate: range.start,
        endDate: range.end,
      }).unwrap();
      setDashboardData(data ?? []);
    },
    [tenantId, fetchOperationalKpi]
  );

  // ── Derived data ──────────────────────────────────────────────────────────
  const operationalKpiData = useMemo(
    () =>
      dashboardData.map((item) => {
        const config = OperationalInsightsConfig[item.title];
        return {
          title: t(item.kpi.title),
          colour: item.kpi.colour,
          violationsCount: item.kpi.violationsCount || 0,
          lastDetection: item.kpi.lastDetection || "-",
          lastDetectionTime: item.kpi.lastDetectionTime || "-",
          icon: config?.icon,
          route: config?.route || "/",
          tooltipMessage: config?.tooltipMessage || "",
        };
      }),
    [dashboardData, t]
  );

  const peopleInsideProps = useMemo(
    () => buildEntryExitProps(dashboardData, "People Count in Factory Premises"),
    [dashboardData]
  );
  const canteenInsideProps = useMemo(() => buildCanteenInsideProps(dashboardData), [dashboardData]);
  const vehicleCountProps = useMemo(
    () => buildEntryExitProps(dashboardData, "Vehicle Count & ANPR at Gates"),
    [dashboardData]
  );
  const vehicleLoadingProps = useMemo(
    () => buildEntryExitProps(dashboardData, "Vehicle Unloading / Loading Monitoring"),
    [dashboardData]
  );
  const parkingProps = useMemo(() => buildParkingProps(dashboardData), [dashboardData]);
  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs: TabConfig[] = [
    {
      label: "People Count in Factory Premises",
      featureId: FEATURE.PEOPLE_COUNT,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid size={{ xs: 12 }} sx={{ display: "flex", height: { xs: "50vh", md: "100%" }, width: "100%" }} padding={{ xs: "10px" }}>
            {operationalKpiLoading ? (
              <Loader />
            ) : (
              <TimeLineAreaChart {...peopleInsideProps} />
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Vehicle Count & ANPR at Gates",
      featureId: FEATURE.VEHICLE_COUNT,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid size={{ xs: 12 }} sx={{ display: "flex", height: { xs: "50vh", md: "100%" }, width: "100%" }} padding={{ xs: "10px" }}>
            {operationalKpiLoading ? (
              <CircularProgress />
            ) : (
              <TimeLineAreaChart {...vehicleCountProps} />
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Canteen Usage Monitoring",
      featureId: FEATURE.CANTEEN_USAGE,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid size={{ xs: 12 }} sx={{ display: "flex", height: { xs: "50vh", md: "100%" }, width: "100%" }}>
             {operationalKpiLoading ? (
              <Loader />
            ) : (
              <TimeLineAreaChart {...canteenInsideProps} />
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Vehicle Unloading / Loading Monitoring",
      featureId: FEATURE.VEHICLE_UNLOADING_LOADING,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid size={{ xs: 12 }} sx={{ display: "flex", height: { xs: "50vh", md: "100%" }, width: "100%" }} padding={{ xs: "10px" }}>
            {operationalKpiLoading ? (
              <Loader />
            ) : (
              <TimeLineAreaChart {...vehicleLoadingProps} />
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Unauthorized Parking / Blocking Aisles",
      featureId: FEATURE.UNAUTHORIZED_PARKING,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid size={{ xs: 12 }} sx={{ display: "flex", height: { xs: "50vh", md: "100%" }, width: "100%" }} padding={{ xs: "10px" }}>
            {operationalKpiLoading ? (
              <Loader />
            ) : (
              <TimeLineAreaChart {...parkingProps} />
            )}
          </Grid>
        </Grid>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        pt: 2,
        px: 3,
        backgroundColor: "#ffffff",
        borderRadius: 2,
        flex: 1,
        minHeight: { xs: "auto", sm: "auto", md: 0 },
      }}
    >
      {/* KPI cards + TimeFilter share one row — no dedicated filter row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <Grid container spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
          {operationalKpiLoading || !dashboardData.length
            ? Array.from({ length: 5 }).map((_, i) => (
                <Grid key={`skeleton-${i + 1}`} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
                  <KpiCardSkeleton />
                </Grid>
              ))
            : operationalKpiData.map((kpi) => (
                <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
                  <DashboardKpiCard {...kpi} />
                </Grid>
              ))}
        </Grid>
        <Box sx={{ flexShrink: 0 }}>
          <CollapsibleTimeFilter
            onRangeChange={handleTimeRangeChange}
            shifts={USE_MOCK ? mockOperationalShifts : (orgShifts || [])} // 👈 Mock shifts when needed
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: { xs: "500px", sm: "600px", md: 0 },
        }}
      >
        <DashboardTabs tabs={tabs} features={features} />
      </Box>
    </Paper>
  );
};

export default OperationalInsightsDashboard;
