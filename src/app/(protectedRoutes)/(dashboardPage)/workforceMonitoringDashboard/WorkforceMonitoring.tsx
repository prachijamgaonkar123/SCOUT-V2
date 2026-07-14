
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Grid, Paper } from "@mui/material";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import DashboardTabs, {
  TabConfig,
} from "@/app/components/organisms/DashboardTabs/DashboardTabs";
import EngineeringIcon from "@mui/icons-material/Engineering";
import DynamicBarChart from "@/app/components/organisms/BarChart/BarChart";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  useGetOrgShiftTimeWorkforceDataQuery,
  useLazyGetWorkforceMonitoringDashboardKpiDataQuery,
} from "./WorkforceMonitoringDashboardApi";
import { WorkforceMonitoringConfig } from "./WorkforceMonitoringDashboardConfig";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import {
  CriticalAreaGraphData,
  WorkforceGatePoint,
  WorkforceMonitoringDashboardResponse,
  WorkforceMonitoringSocketPayload,
} from "./WorkforceMonitoringDashboard.types";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { FEATURE } from "@/app/config/featureRegistry";
import TimeScaleLineChart from "@/app/components/organisms/TimeScaleLineChart/TimeScaleLineChart";
import DashboardKpiCard from "@/app/components/molecules/MonitoringDashboardKpiCard/MonitoringDashboardKpiCard";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

// ---------- MOCK DATA IMPORTS ----------
import { mockWorkforceDashboardData, mockWorkforceShifts } from "./Mockdata";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ─── Helper: safely extract CriticalAreaGraphData from union ─────────────────
function isCriticalAreaGraphData(
  data: unknown
): data is CriticalAreaGraphData {
  return !!data && !Array.isArray(data) && typeof data === "object";
}

// ─── Helper: build chart props from a use-case title ─────────────────────────
function buildCriticalAreaProps(
  dashboardData: WorkforceMonitoringDashboardResponse[],
  title: string
) {
  const usecase = dashboardData.find((d) => d.title === title);
  const raw = usecase?.graphs?.data;
  const graphData = isCriticalAreaGraphData(raw) ? raw : null;

  const series =
    graphData?.series.map((zone) => ({
      label: zone.zone,
      data: zone.data.map((p) => p.count),
      color: zone.color,
      showMark: false,
    })) ?? [];

  const firstZone = graphData?.series[0]?.data ?? [];
  const xAxisDates = firstZone.map((p) => p.date);
  const xAxisTimes = firstZone.map((p) => p.time ?? p.day ?? "");
  const granularity: CriticalAreaGraphData["granularity"] =
    graphData?.granularity ?? "hour";

  return { series, xAxisDates, xAxisTimes, granularity };
}


function buildFlatBarData(
  dashboardData: WorkforceMonitoringDashboardResponse[],
  title: string
): WorkforceGatePoint[] {
  const usecase = dashboardData.find((d) => d.title === title);
  const raw = usecase?.graphs?.data;
  if (!Array.isArray(raw)) return [];
  return raw; // already WorkforceGatePoint[]
}
// ─── Component ────────────────────────────────────────────────────────────────
const WorkforceMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const { user, features } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  const [isLiveMode, setIsLiveMode] = useState(true);
  const [dashboardData, setDashboardData] = useState<
    WorkforceMonitoringDashboardResponse[]
  >([]);

  // ── API ──────────────────────────────────────────────────────────────────
  const { data: orgShifts } = useGetOrgShiftTimeWorkforceDataQuery(
    { tenantId },
    { skip: !tenantId || USE_MOCK } // 👈 Skip when mock mode is on
  );

  const [fetchWorkforceKpi, { isFetching: WorkforcekpiLoading }] =
    useLazyGetWorkforceMonitoringDashboardKpiDataQuery();

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return;

    if (USE_MOCK) {
      // 👈 Use static mock data
      setDashboardData(mockWorkforceDashboardData);
      return;
    }

    fetchWorkforceKpi({ tenantId })
      .unwrap()
      .then((kpi) => setDashboardData(kpi ?? []))
      .catch(console.error);
  }, [tenantId, fetchWorkforceKpi]);

  // ── Socket (live mode) ────────────────────────────────────────────────────
  useSocketEvent<WorkforceMonitoringSocketPayload>({
    tenantId,
    enabled: isLiveMode && !USE_MOCK, // 👈 Disable socket in mock mode
    event: SOCKET_EVENTS.WORKFORCE_UPDATE,
    handler: (payload) => {
      if (!payload?.data) return;
      setDashboardData(payload.data);
    },
  });

  // ── Time filter ───────────────────────────────────────────────────────────
  const handleworkforceTimeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (USE_MOCK) {
        // 👈 Return mock data (optionally filter by range if needed)
        setDashboardData(mockWorkforceDashboardData);
        return;
      }

      if (!range.start && !range.end) {
        setIsLiveMode(true);
        const res = await fetchWorkforceKpi({ tenantId }).unwrap();
        setDashboardData(res ?? []);
        return;
      }
      setIsLiveMode(false);
      const kpi = await fetchWorkforceKpi({
        tenantId,
        startDate: range.start,
        endDate: range.end,
      }).unwrap();
      setDashboardData(kpi ?? []);
    },
    [tenantId, fetchWorkforceKpi]
  );

  // ── Derived data ──────────────────────────────────────────────────────────
  const workforceKpiData = useMemo(
    () =>
      dashboardData.map((item) => {
        const config = WorkforceMonitoringConfig[item.title];
        return {
          title: t(item.kpi.title),
          colour: item.kpi.colour,
          violationsCount: item.kpi.violationsCount || 0,
          lastDetection: item.kpi.lastDetection || "-",
          lastDetectionTime: item.kpi.lastDetectionTime || "",
          icon: config?.icon || EngineeringIcon,
          route: config?.route || "/",
          tooltipMessage: config?.tooltipMessage || "",
        };
      }),
    [dashboardData, t]
  );

  // FIX: consolidated + type-safe helpers replace 6 separate useMemos each
  const criticalAreaProps = useMemo(
    () => buildCriticalAreaProps(dashboardData, "Employee Presence in Critical Areas"),
    [dashboardData]
  );

  const restrictedAreaProps = useMemo(
    () => buildCriticalAreaProps(dashboardData, "Employee Presence in Restricted Areas"),
    [dashboardData]
  );

  const employeeIdleGraphData = useMemo(
    () => buildFlatBarData(dashboardData, "Employee Idle Time Monitoring"),
    [dashboardData]
  );

  // Same TimeScaleLineChart shape as Employee Presence in Critical Areas,
  // built from the flat per-gate counts instead of a per-zone time series.
  const employeeIdleLineProps = useMemo(() => {
    const series = [
      {
        label: "Idle Count",
        data: employeeIdleGraphData.map((p) => Number(p.idleCount) || 0),
        color: DASHBOARD_COLORS.warning,
        showMark: false,
      },
      {
        label: "Working Count",
        data: employeeIdleGraphData.map((p) => Number(p.workingCount) || 0),
        color: DASHBOARD_COLORS.success,
        showMark: false,
      },
      {
        label: "Not Present Count",
        data: employeeIdleGraphData.map((p) => Number(p.notPresentCount) || 0),
        color: DASHBOARD_COLORS.workforce,
        showMark: false,
      },
    ];
    return {
      series,
      xAxisDates: employeeIdleGraphData.map((p) => p.gate),
      xAxisTimes: employeeIdleGraphData.map(() => ""),
      granularity: "hour" as const,
    };
  }, [employeeIdleGraphData]);

  const mobileUsageProps = useMemo(
    () =>
      buildCriticalAreaProps(dashboardData, "Mobile Phone Usage in Restricted Zones"),
    [dashboardData]
  );

  const sleepingAbsenceGraphData = useMemo(
    () =>
      buildFlatBarData(
        dashboardData,
        "Sleeping / Absence of Security Guards"
      ),
    [dashboardData]
  );

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs: TabConfig[] = [
    {
      label: "Employee Idle Time Monitoring",
      featureId: FEATURE.EMPLOYEE_IDLE_TIME,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
            }}
            padding={{ xs: "10px" }}
          >
            {WorkforcekpiLoading ? (
              <CircularProgress />
            ) : (
              <TimeScaleLineChart {...employeeIdleLineProps} padStart={false} xAxisLabel="Zone" />
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Employee Presence in Critical Areas",
      featureId: FEATURE.EMPLOYEE_PRESENCE_CRITICAL_AREA,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
            }}
            padding={{ xs: "10px" }}
          >
            {/* FIX: was incorrectly using criticalArea props for both tabs */}
            <TimeScaleLineChart {...criticalAreaProps} />
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Employee Presence in Restricted Areas",
      featureId: FEATURE.EMPLOYEE_PRESENCE_CRITICAL_AREA,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
            }}
            padding={{ xs: "10px" }}
          >
            {/* FIX: now correctly uses restrictedArea props */}
            <TimeScaleLineChart {...restrictedAreaProps} />
            {/* <TimeScaleLineChart2 {...restrictedAreaProps} /> */}

          </Grid>
        </Grid>
      ),
    },
    {
      label: "Mobile Phone Usage in Restricted Zones",
      featureId: FEATURE.MOBILE_PHONE_USAGE,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
            }}
            padding={{ xs: "10px" }}
          >
            <TimeScaleLineChart {...mobileUsageProps} />
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Sleeping / Absence of Security Guards",
      featureId: FEATURE.SAFETY_COMPLIANCE,
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
            }}
          >
            <DynamicBarChart
              data={sleepingAbsenceGraphData}
              xAxisKey="gate"
              series={[
                { dataKey: "Absent", label: "Absent Count", color: DASHBOARD_COLORS.workforce },
                { dataKey: "Present", label: "Present Count", color: DASHBOARD_COLORS.success },
              ]}
              yAxisLabel="Count"
              stackId="exitStatus"
            />
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
          {WorkforcekpiLoading || !dashboardData.length
            ? Array.from({ length: 4 }).map((_, index) => (
                <Grid key={index+1} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
                  <KpiCardSkeleton />
                </Grid>
              ))
            : workforceKpiData.map((kpi) => (
                <Grid
                  key={kpi.title}
                  size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}
                >
                  <DashboardKpiCard {...kpi} />
                </Grid>
              ))}
        </Grid>
        <Box sx={{ flexShrink: 0 }}>
          <CollapsibleTimeFilter
            onRangeChange={handleworkforceTimeRangeChange}
            shifts={USE_MOCK ? mockWorkforceShifts : (orgShifts || [])} // 👈 Mock shifts when needed
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

export default WorkforceMonitoring;