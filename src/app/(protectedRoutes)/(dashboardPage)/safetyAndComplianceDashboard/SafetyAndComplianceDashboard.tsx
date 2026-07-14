

"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper } from "@mui/material";

import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";
import DashboardTabs, {
  TabConfig,
} from "@/app/components/organisms/DashboardTabs/DashboardTabs";

import EngineeringIcon from "@mui/icons-material/Engineering";
import DynamicBarChart from "@/app/components/organisms/BarChart/BarChart";
import DynamicPieChart from "@/app/components/organisms/PieChart/PieChart";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { FEATURE } from "@/app/config/featureRegistry";
import { useTranslation } from "react-i18next";
import { DASHBOARD_COLORS, CHART_COLORS } from "@/app/config/dashboardTheme";
import {
  CrowdSeriesItem,
  EmergencyExitGraphData,
  FallSeriesItem,
  FireSmokeBucket,
  FireSmokeGraphData,
  PPEGraphData,
  SafetySocketPayload,
  SurveillanceDashboardResponse,
  VehicleWalkwayResponse,
} from "./SafetyAndComplianceDashboard.types";
import {
  useGetOrgShiftTimeSafetyDataQuery,
  useLazyGetSafetyAndComplianceDashboardKpiDataQuery,
} from "./SafetyAndComplianceDashboardApi";
import { SafetyMonitoringConfig } from "./SafetyAndComplianceDashboardConfig";

import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import DashboardKpiCard from "@/app/components/molecules/MonitoringDashboardKpiCard/MonitoringDashboardKpiCard";
import TimeScaleLineChart from "@/app/components/organisms/TimeScaleLineChart/TimeScaleLineChart";

// ---------- MOCK DATA IMPORTS ----------
import { mockShifts, mockDashboardData } from "./Mockdata";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const SafetyAndComplianceDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, features } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [isSafetyDashboardLiveMode, setIsSafetyDashboardLiveMode] =
    useState(true);

  const [displaySafetyKpi, setDisplaySafetyKpi] = useState<
    SurveillanceDashboardResponse[]
  >([]);

  /* ---------- API HOOKS ---------- */
  const { data: SafetyOrgShifts } = useGetOrgShiftTimeSafetyDataQuery(
    { tenantId },
    { skip: !tenantId || USE_MOCK } // 👈 Skip when mock mode is on
  );

  const [fetchSafetyKpi, { isFetching: safetykpiLoading }] =
    useLazyGetSafetyAndComplianceDashboardKpiDataQuery();

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (!tenantId) return;

    if (USE_MOCK) {
      // 👈 Use static mock data
      setDisplaySafetyKpi(mockDashboardData);
      return;
    }

    const load = async () => {
      const kpi = await fetchSafetyKpi({ tenantId }).unwrap();
      setDisplaySafetyKpi(kpi ?? []);
    };
    load();
  }, [tenantId, fetchSafetyKpi]);

  /* ---------- SOCKET (LIVE ONLY) ---------- */
  const handleSafetySocketUpdate = useCallback(
    (payload: SafetySocketPayload) => {
      if (!payload?.data) return;
      setDisplaySafetyKpi(payload.data);
    },
    []
  );

  useSocketEvent<SafetySocketPayload>({
    tenantId,
    enabled: isSafetyDashboardLiveMode && !USE_MOCK, // 👈 Disable socket in mock mode
    event: SOCKET_EVENTS.SAFETY_DASHBOARD_UPDATE,
    handler: handleSafetySocketUpdate,
  });

  /* ---------- TIME FILTER ---------- */
  const handleTimeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (USE_MOCK) {
        // 👈 Return mock data (optionally filter by range if needed)
        setDisplaySafetyKpi(mockDashboardData);
        return;
      }

      if (!range.start && !range.end) {
        setIsSafetyDashboardLiveMode(true);
        const res = await fetchSafetyKpi({ tenantId }).unwrap();
        setDisplaySafetyKpi(res ?? []);
        return;
      }

      setIsSafetyDashboardLiveMode(false);
      const payload = {
        tenantId: tenantId,
        startDate: range.start,
        endDate: range.end,
      };
      const kpi = await fetchSafetyKpi(payload).unwrap();
      setDisplaySafetyKpi(kpi ?? []);
    },
    [tenantId, fetchSafetyKpi]
  );

  /* ---------- KPI DATA TRANSFORMATION ---------- */
  const safetyKpiData = useMemo(() => {
    return displaySafetyKpi.map((item) => {
      const config = SafetyMonitoringConfig[item.title];

      return {
        title: t(item.kpi.title),
        tone: item.kpi.colour,
        violationsCount: item.kpi.violationsCount || 0,
        lastDetection: item.kpi.lastDetection || "-",
        lastDetectionTime: item.kpi.lastDetectionTime || "-",
        icon: config?.icon || EngineeringIcon,
        route: config?.route || "/",
        tooltipMessage: config?.tooltipMessage || "",
      };
    });
  }, [displaySafetyKpi, t]);

  /* ---------- EXTRACT DATA FOR CHARTS ---------- */
  const fireSmokeDashboard = displaySafetyKpi.find(
    (d) => d.title === "Fire and Smoke Detection"
  );

  const fallLaydownDashboard = displaySafetyKpi.find(
    (d) => d.title === "Fall Detection"
  );

  const ppeDashboard = displaySafetyKpi.find(
    (d) => d.title === "PPE Detection (Helmet, Vest, Glasses)"
  );

  const graphDataForPPE =
    ppeDashboard?.graphs?.data &&
    typeof ppeDashboard.graphs.data === "object" &&
    !Array.isArray(ppeDashboard.graphs.data) &&
    "violationTypePieData" in ppeDashboard.graphs.data
      ? (ppeDashboard.graphs.data as PPEGraphData)
      : undefined;

  const ppeViolationTypePieData = graphDataForPPE?.violationTypePieData ?? [];
  const ppeZoneWisePieData = graphDataForPPE?.zoneWisePieData ?? [];

  // Emergency Exit Blockage
  const emergencyExitDashboard = displaySafetyKpi.find(
    (d) => d.title === "Emergency Exit Blockage Detection"
  );
  const emergencyExitGraphData =
    emergencyExitDashboard?.graphs?.data &&
    typeof emergencyExitDashboard.graphs.data === "object" &&
    !Array.isArray(emergencyExitDashboard.graphs.data) &&
    "barChartData" in emergencyExitDashboard.graphs.data
      ? (emergencyExitDashboard.graphs.data as EmergencyExitGraphData)
      : undefined;
  const exitGateBarData = emergencyExitGraphData?.barChartData ?? [];
  const exitZoneWisePieData = emergencyExitGraphData?.zoneWisePieData ?? [];
  const ppeSeries = graphDataForPPE?.series ?? [];
  const ppeXAxisDates = ppeSeries.map((item) => item.date ?? "");
  const ppeXAxisTimes = ppeSeries.map((item) => item.time ?? item.day ?? "");
  const ppeGranularity = graphDataForPPE?.granularity ?? "hour";

  // Fire & Smoke
  const graphDataForFireSmoke =
    fireSmokeDashboard?.graphs?.data &&
    typeof fireSmokeDashboard.graphs.data === "object" &&
    !Array.isArray(fireSmokeDashboard.graphs.data) &&
    "hazardTypePieData" in fireSmokeDashboard.graphs.data
      ? (fireSmokeDashboard.graphs.data as FireSmokeGraphData)
      : undefined;

  const fireSmokeGranularity = graphDataForFireSmoke?.granularity ?? "hour";
  const fireSmokeSeries = graphDataForFireSmoke?.series ?? [];
  const fireSmokeXAxisDates = fireSmokeSeries.map(
    (item: FireSmokeBucket) => item.date ?? ""
  );
  const fireSmokeXAxisTimes = fireSmokeSeries.map(
    (item: FireSmokeBucket) => item.time ?? item.day ?? ""
  );
  const hazardTypePieData = graphDataForFireSmoke?.hazardTypePieData ?? [];
  const zoneWisePieData = graphDataForFireSmoke?.zoneWisePieData ?? [];
  const totalHazardType = hazardTypePieData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // Fall
  const graphDataForFallDetection =
    fallLaydownDashboard?.graphs?.data &&
    !Array.isArray(fallLaydownDashboard.graphs.data)
      ? fallLaydownDashboard.graphs.data
      : undefined;

  const zoneWisePieDataForFall =
    graphDataForFallDetection?.zoneWisePieData ?? [];
  const fallSeries: FallSeriesItem[] =
    fallLaydownDashboard?.graphs?.data?.series ?? [];
  const xAxisTimes = fallSeries.map((item) => item.time ?? "");
  const xAxisDates = fallSeries.map((item) => item.date ?? "");
  const lineSeries = [
    {
      label: "Fall Incidents",
      data: fallSeries.map((item) => item.count),
      color: DASHBOARD_COLORS.warning,
      showMark: true,
    },
  ];

  // Crowd
  const crowdGatheringDashboard = displaySafetyKpi.find(
    (d) => d.title === "Crowd Detection in Hazardous Zones"
  );

  const graphDataForCrowdGathering =
    crowdGatheringDashboard?.graphs?.data &&
    !Array.isArray(crowdGatheringDashboard.graphs.data)
      ? crowdGatheringDashboard.graphs.data
      : undefined;

  const crowdGranularity = graphDataForCrowdGathering?.granularity ?? "hour";
  const crowdSeries = (graphDataForCrowdGathering?.series ??
    []) as CrowdSeriesItem[];
  const crowdXAxisDates = crowdSeries.map((item) => item.date ?? "");
  const crowdXAxisTimes = crowdSeries.map((item) => item.time ?? "");
  const zoneWisePieDataForCrowd =
    graphDataForCrowdGathering?.zoneWisePieData ?? [];

  // Vehicle
  const vehicleWalkwayDashboard = displaySafetyKpi.find(
    (d): d is VehicleWalkwayResponse =>
      d.title === "Forklift / Vehicle in Walkways"
  );

  const graphDataForVehicleWalkway = vehicleWalkwayDashboard?.graphs?.data;
  const vehicleGranularity = graphDataForVehicleWalkway?.granularity ?? "hour";
  const vehicleSeries = graphDataForVehicleWalkway?.series ?? [];
  const vehicleZoneWisePieData =
    graphDataForVehicleWalkway?.zoneWisePieData ?? [];
  const vehicleXAxisTimes =
    vehicleSeries[0]?.data.map((item) => item.time ?? "") ?? [];
  const vehicleXAxisDates =
    vehicleSeries[0]?.data.map((item) => item.date ?? "") ?? [];
  const vehicleLineSeries = vehicleSeries.map((series, index) => ({
    label: series.label,
    data: series.data.map((item) => item.value),
    color: vehicleZoneWisePieData[index]?.color ?? DASHBOARD_COLORS.primary,
    showMark: true,
  }));

  /* ---------- TABS CONFIG ---------- */
  const tabs: TabConfig[] = [
    {
      label: "Fire and Smoke Detection",
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
              "& .MuiCardContent-root": { height: "100%" },
            }}
          >
            <TimeScaleLineChart
              granularity={fireSmokeGranularity}
              xAxisDates={fireSmokeXAxisDates}
              xAxisTimes={fireSmokeXAxisTimes}
              series={[
                {
                  label: "Fire",
                  data: fireSmokeSeries.map((item) => item.fireCount),
                  color: hazardTypePieData[0]?.color ?? DASHBOARD_COLORS.warning,
                  showMark: true,
                },
                {
                  label: "Smoke",
                  data: fireSmokeSeries.map((item) => item.smokeCount),
                  color: hazardTypePieData[1]?.color ?? DASHBOARD_COLORS.primary,
                  showMark: true,
                },
              ]}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
              p: { xs: 1, md: 0 },
              height: { xs: "40vh", md: "100%" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {hazardTypePieData.length > 0 && totalHazardType > 0 && (
                <DynamicPieChart
                  data={hazardTypePieData}
                  carttitle="Hazard Type Distribution"
                />
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {zoneWisePieData.length > 0 && (
                <DynamicPieChart
                  data={zoneWisePieData}
                  carttitle="Zone-wise Hazard Detection"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      ),
      featureId: FEATURE.FIRE_SMOKE,
    },
    {
      label: "PPE Detection (Helmet, Vest, Glasses)",
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
              "& .MuiCardContent-root": { height: "100%" },
            }}
          >
            <TimeScaleLineChart
              granularity={ppeGranularity}
              xAxisDates={ppeXAxisDates}
              xAxisTimes={ppeXAxisTimes}
              series={[
                {
                  label: "Helmet",
                  data: ppeSeries.map((item) => item.helmet),
                  color: ppeViolationTypePieData[0]?.color ?? CHART_COLORS[0],
                  showMark: true,
                },
                {
                  label: "Vest",
                  data: ppeSeries.map((item) => item.vest),
                  color: ppeViolationTypePieData[1]?.color ?? CHART_COLORS[1],
                  showMark: true,
                },
                {
                  label: "Glasses",
                  data: ppeSeries.map((item) => item.glasses),
                  color: ppeViolationTypePieData[2]?.color ?? CHART_COLORS[2],
                  showMark: true,
                },
              ]}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
              p: { xs: 1, md: 0 },
              height: { xs: "40vh", md: "100%" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {ppeViolationTypePieData.length > 0 && (
                <DynamicPieChart
                  data={ppeViolationTypePieData}
                  carttitle="PPE Detection (Helmet, Vest, Glasses)"
                />
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {ppeZoneWisePieData.length > 0 && (
                <DynamicPieChart
                  data={ppeZoneWisePieData}
                  carttitle="PPE Violations by Zone"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      ),
      featureId: FEATURE.PPE_DETECTION,
    },
    {
      label: "Forklift / Vehicle in Walkways",
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
              "& .MuiCardContent-root": { height: "100%" },
            }}
          >
            <TimeScaleLineChart
              granularity={vehicleGranularity}
              xAxisDates={vehicleXAxisDates}
              xAxisTimes={vehicleXAxisTimes}
              series={vehicleLineSeries}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
              p: { xs: 1, md: 0 },
              height: { xs: "40vh", md: "100%" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {vehicleZoneWisePieData.length > 0 && (
                <DynamicPieChart
                  data={vehicleZoneWisePieData}
                  carttitle="Vehicle in Walkways by Zone"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      ),
      featureId: FEATURE.OBJECT_DETECTION,
    },
    {
      label: "Fall Detection",
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
              "& .MuiCardContent-root": { height: "100%" },
            }}
          >
            <TimeScaleLineChart
              series={lineSeries}
              xAxisDates={xAxisDates}
              xAxisTimes={xAxisTimes}
              granularity="hour"
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
              p: { xs: 1, md: 0 },
              height: { xs: "40vh", md: "100%" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {zoneWisePieDataForFall.length > 0 && (
                <DynamicPieChart
                  data={zoneWisePieDataForFall}
                  carttitle="Zone-wise Fall/Laydown Incidents"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      ),
      featureId: FEATURE.FALL_DETECTION,
    },
    {
      label: "Emergency Exit Blockage Detection",
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
              "& .MuiCardContent-root": { height: "100%" },
            }}
          >
            <DynamicBarChart
              data={exitGateBarData}
              xAxisKey="gate"
              series={[
                { dataKey: "blocked", label: "Blocked Hours", color: DASHBOARD_COLORS.warning },
                { dataKey: "clear", label: "Clear Hours", color: DASHBOARD_COLORS.success },
              ]}
              yAxisLabel="Hours"
              stackId="exitStatus"
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
              p: { xs: 1, md: 0 },
              height: { xs: "40vh", md: "100%" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {exitZoneWisePieData.length > 0 && (
                <DynamicPieChart
                  data={exitZoneWisePieData}
                  carttitle="Zone-wise Blocked Emergency Exits"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      ),
      featureId: FEATURE.EMERGENCY_EXIT_BLOCKAGE,
    },
    {
      label: "Crowd Detection in Hazardous Zones",
      content: (
        <Grid container sx={{ alignItems: "stretch", height: "100%" }}>
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{
              display: "flex",
              height: { xs: "50vh", md: "100%" },
              width: "100%",
              "& .MuiCardContent-root": { height: "100%" },
            }}
          >
            <TimeScaleLineChart
              granularity={crowdGranularity}
              xAxisDates={crowdXAxisDates}
              xAxisTimes={crowdXAxisTimes}
              series={[
                {
                  label: "Crowd Incidents",
                  data: crowdSeries.map((item) => item.count),
                  color: DASHBOARD_COLORS.primary,
                  showMark: true,
                },
                {
                  label: "Mob Count",
                  data: crowdSeries.map((item) => item.mobCount),
                  color: DASHBOARD_COLORS.warning,
                  showMark: true,
                },
              ]}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
              p: { xs: 1, md: 0 },
              height: { xs: "40vh", md: "100%" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "50%", md: "100%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 140, md: "50%" },
              }}
            >
              {zoneWisePieDataForCrowd.length > 0 && (
                <DynamicPieChart
                  data={zoneWisePieDataForCrowd}
                  carttitle="Zone-wise Crowd Gathering Incidents"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      ),
      featureId: FEATURE.CROWD_DETECTION,
    },
  ];

  /* ---------- RENDER ---------- */
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
      {/* KPI cards + TimeFilter */}
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
          {safetykpiLoading || !displaySafetyKpi.length
            ? Array.from({ length: 4 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
                  <KpiCardSkeleton />
                </Grid>
              ))
            : safetyKpiData.map((kpi) => (
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
            onRangeChange={handleTimeRangeChange}
            shifts={USE_MOCK ? mockShifts : (SafetyOrgShifts || [])} // 👈 Mock shifts when needed
          />
        </Box>
      </Box>

      {/* Tabs */}
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

export default SafetyAndComplianceDashboard;