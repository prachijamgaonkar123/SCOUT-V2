

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { DirectionsCar, Shield, Visibility, People } from "@mui/icons-material";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import DashboardKpiCardMain from "@/app/components/molecules/DashboardKpiCardMain/DashboardKpiCardMainOld";
import {
  useGetOrgShiftTimeDashboardDataQuery,
  useLazyGetMainDashboardKpiDataQuery,
  useLazyGetCameraTamperingDashboardKpiDataQuery,
} from "./DashboardApi";
import {
  CameraTamperingDashboardConfig,
  MainDashboardConfig,
} from "./DashboardConfig";
import {
  CameraTamperingKpiCard,
  
  DashboardMonitoringSocketPayload,
  MainDashboardResponse,
} from "./Dashboard.types";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";
  console.log("tenant id from the dashboard", tenantId);
  /* ---------- STATE ---------- */
  const [isDashboardLiveMode, setIsDashboardLiveMode] = useState(true);

  const [mainDashboardData, setMainDashboardData] =
    useState<MainDashboardResponse | null>(null);
  const [cameraTamperingKpis, setCameraTamperingKpis] = useState<
    CameraTamperingKpiCard[]
  >([]);
  /* ---------- API HOOKS ---------- */

  const { data: orgShifts } = useGetOrgShiftTimeDashboardDataQuery(
    { tenantId },
    { skip: !tenantId },
  );

  const [fetchMainDashboardKpi, { isFetching: MainDashboardkpiLoading }] =
    useLazyGetMainDashboardKpiDataQuery();

  const [
    fetchCameraTamperingDashboardKpi,
    { isFetching: CameraTamperingDashboardkpiLoading },
  ] = useLazyGetCameraTamperingDashboardKpiDataQuery();

  //initial load

  useEffect(() => {
    if (!tenantId) return;

    const loadDashboardData = async () => {
      try {
        const [mainRes, cameraRes] = await Promise.allSettled([
          fetchMainDashboardKpi({ tenantId }).unwrap(),
          fetchCameraTamperingDashboardKpi({ tenantId }).unwrap(),
        ]);

        // ✅ MAIN DASHBOARD
        if (mainRes.status === "fulfilled") {
          setMainDashboardData(mainRes.value);
        } else {
          console.error("Main Dashboard API Failed:", mainRes.reason);
        }

        // ✅ CAMERA TAMPERING
        if (cameraRes.status === "fulfilled") {
          setCameraTamperingKpis(cameraRes.value);
        } else {
          console.error("Camera Tampering API Failed:", cameraRes.reason);
          setCameraTamperingKpis([]); // fallback
        }
      } catch (error) {
        console.error("Unexpected Error:", error);
      }
    };
    loadDashboardData();
  }, [tenantId, fetchMainDashboardKpi, fetchCameraTamperingDashboardKpi]);

  /* ---------- SOCKET (LIVE ONLY) ---------- */
useSocketEvent<DashboardMonitoringSocketPayload>({
  tenantId,
  enabled: isDashboardLiveMode,
  event: SOCKET_EVENTS.MAIN_DASHBOARD_UPDATE,
  handler: (payload) => {
    console.log("📡 MAIN DASHBOARD Monitoring socket payload:", payload);

      if (!payload?.data) return;

  setMainDashboardData(payload.data.dashboard ?? null);
  setCameraTamperingKpis(payload.data.cameraTampering ?? []);

  },
});

  /* ---------- TIME FILTER ---------- */

  const handleTimeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!tenantId) return;

      try {
        if (!range.start && !range.end) {
          setIsDashboardLiveMode(true);

          const [mainDashboardResponse, cameraTamperingResponse] =
            await Promise.all([
              fetchMainDashboardKpi({ tenantId }).unwrap(),
              fetchCameraTamperingDashboardKpi({ tenantId }).unwrap(),
            ]);

          setMainDashboardData(mainDashboardResponse);
          setCameraTamperingKpis(cameraTamperingResponse);
          return;
        }

        setIsDashboardLiveMode(false);

        const payload = {
          tenantId,
          startDate: range.start,
          endDate: range.end,
        };

        const [mainDashboardResponse, cameraTamperingResponse] =
          await Promise.all([
            fetchMainDashboardKpi(payload).unwrap(),
            fetchCameraTamperingDashboardKpi(payload).unwrap(),
          ]);

        setMainDashboardData(mainDashboardResponse);
        setCameraTamperingKpis(cameraTamperingResponse);
      } catch (error) {
        console.error("Dashboard filter error:", error);
      }
    },
    [tenantId, fetchMainDashboardKpi, fetchCameraTamperingDashboardKpi],
  );


const safetyDashboardKpis = useMemo(() => {
  if (!mainDashboardData?.safety) return [];
  return mainDashboardData.safety.map((item) => {
    const config = MainDashboardConfig[item.title as keyof typeof MainDashboardConfig];
    return { ...item, route: config?.route || "/" };
  });
}, [mainDashboardData]);

const surveillanceDashboardKpis = useMemo(() => {
  if (!mainDashboardData?.surveillance) return [];
  return mainDashboardData.surveillance.map((item) => {
    const config = MainDashboardConfig[item.title as keyof typeof MainDashboardConfig];
     console.log(
      "Surveillance KPI:",
      item.title,
      "Route:",
      config?.route
    );

    return { ...item, route: config?.route || "/" };
  });
}, [mainDashboardData]);

const operationalDashboardKpis = useMemo(() => {
  if (!mainDashboardData?.operational) return [];
  return mainDashboardData.operational.map((item) => {
    const config = MainDashboardConfig[item.title as keyof typeof MainDashboardConfig];
    return { ...item, route: config?.route || "/" };
  });
}, [mainDashboardData]);

const workforceDashboardKpis = useMemo(() => {
  if (!mainDashboardData?.workforce) return [];
  return mainDashboardData.workforce.map((item) => {
    const config = MainDashboardConfig[item.title as keyof typeof MainDashboardConfig];
    return { ...item, route: config?.route || "/" };
  });
}, [mainDashboardData]);
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
        // minHeight: 0,
        minHeight: { xs: "auto", sm: "auto", md: 0 },
      }}
    >
      {/* Top Right Time Filter */}
      <Box sx={{ display: "flex", justifyContent: "end", mt: 0.5 }}>
        <TimeFilter
          onRangeChange={handleTimeRangeChange}
          shifts={orgShifts || []}
        />
      </Box>

      <Grid container spacing={2.5} sx={{ my: 1 }}>
        {CameraTamperingDashboardkpiLoading || !cameraTamperingKpis.length
          ? Array.from({ length: 5 }).map((_, index) => (
              <Grid key={index + 1} size={{ xs: 12, sm: 3, md: 3, lg: 2.4 }}>
                <KpiCardSkeleton />
              </Grid>
            ))
          : cameraTamperingKpis.map((item) => {
              const config = CameraTamperingDashboardConfig[item.title as keyof typeof CameraTamperingDashboardConfig];

              return (
                <Grid key={item.title} size={{ xs: 12, sm: 3, md: 3, lg: 2.4 }}>
                  <DashboardKpiCardMain
                    title={item.title}
                    colour={item.colour}
                    violationsCount={item.violationsCount}
                    route={config?.route || "/"}
                  />
                </Grid>
              );
            })}
      </Grid>

      {/* Dashboard Sections Grid */}
      <Grid container spacing={2} sx={{ mb: 1.3 }}>
        {/* Row 1 - Safety & Compliance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 1,
              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: 18,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Shield sx={{ color: "#1976d2", fontSize: 23 }} /> Safety And
              Compliance
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 0.5 }}>
              {mainDashboardData?.safety?.length
                ? safetyDashboardKpis.map((kpi, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <DashboardKpiCardMain {...kpi} />
                    </Grid>
                  ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <KpiCardSkeleton />
                    </Grid>
                  ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Row 1 - Surveillance Monitoring */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 1,
              backgroundColor: "#ffffff",
              borderRadius: 2,
              minHeight: 280,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: 18,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Visibility sx={{ color: "#1976d2", fontSize: 23 }} />{" "}
              Surveillance Monitoring
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 0.5 }}>
              {mainDashboardData?.surveillance?.length
                ? surveillanceDashboardKpis.map((kpi, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <DashboardKpiCardMain {...kpi} />
                    </Grid>
                  ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <KpiCardSkeleton />
                    </Grid>
                  ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Row 2 - Operational Insights */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 1,
              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: 18,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <DirectionsCar sx={{ color: "#1976d2", fontSize: 23 }} />{" "}
              Operational Insights
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 0.5 }}>
              {mainDashboardData?.operational?.length
                ? operationalDashboardKpis.map((kpi, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <DashboardKpiCardMain {...kpi} />
                    </Grid>
                  ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <KpiCardSkeleton />
                    </Grid>
                  ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Row 2 - Workforce Monitoring */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 1,
              backgroundColor: "#ffffff",
              borderRadius: 2,
              minHeight: 280,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: 18,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <People sx={{ color: "#1976d2", fontSize: 23 }} /> Workforce
              Monitoring
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 0.5 }}>
              {mainDashboardData?.workforce?.length
                ? workforceDashboardKpis.map((kpi, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <DashboardKpiCardMain {...kpi} />
                    </Grid>
                  ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <Grid key={index + 1} size={{ xs: 12, md: 4, sm: 6 }}>
                      <KpiCardSkeleton />
                    </Grid>
                  ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Dashboard;
