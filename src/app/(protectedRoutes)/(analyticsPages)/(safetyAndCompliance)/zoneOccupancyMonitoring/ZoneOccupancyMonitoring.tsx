"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolationsOld";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import EngineeringIcon from "@mui/icons-material/Engineering";
import {
  useGetOrgShiftTimeDataQuery,
  useGetZoneOccupancyMonitoringSingleReportPdfMutation,
  useGetZoneOccupancyMonitoringDetailedCsvReportMutation,
  useGetZoneOccupancyMonitoringDetailedPdfReportMutation,
  useLazyGetZoneOccupancyMonitoringDataQuery,
  useLazyGetZoneOccupancyMonitoringDetailedReportQuery,
} from "./ZoneOccupancyMonitoringApi";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import { ZoneOccupancyMonitoringKpiConfig } from "./ZoneOccupancyMonitoringConfig";
import {
  ZoneOccupancyMonitoringKpiItem,
  ZoneOccupancyMonitoringFilterParams,
  ZoneOccupancyMonitoringRecentViolation,
  ZoneOccupancyMonitoringSocketPayload,
  ZoneOccupancyMonitoringDetailedReportResponse,
  ZoneOccupancyTrendDataPoint,
  BreakdownMetric,
  ZoneOccupancyChartDataPoint,
} from "./ZoneOccupancyMonitoring.types";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { useTranslation } from "react-i18next";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
import ViolationBreakdown from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";
import ViolationsTrend from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import CollapsibleTimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/CollapsibleTimeFilter";

const ZoneOccupancyMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [filters, setFilters] =
    useState<ZoneOccupancyMonitoringFilterParams>({});
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(
    new Set(),
  );
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<ZoneOccupancyMonitoringRecentViolation | null>(null);

  // Live mode flag — false when time filter range is active
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Overview display state — fed by initial fetch, time filter fetch, OR socket
  const [displayKpi, setDisplayKpi] = useState<
    ZoneOccupancyMonitoringKpiItem[]
  >([]);
  const [displayZoneViolations, setDisplayZoneViolations] = useState<
    { zone: string; incidentCount: number }[]
  >([]);
  const [recentViolationsLive, setRecentViolationsLive] = useState<
    ZoneOccupancyMonitoringRecentViolation[]
  >([]);

  const [detailedReport, setDetailedReport] =
    useState<ZoneOccupancyMonitoringDetailedReportResponse | null>(null);

  const [zoneOccupancyTrendData, setZoneOccupancyTrendData] = useState<
    ZoneOccupancyTrendDataPoint[]
  >([]);
  /* ---------- API HOOKS ---------- */
  const { data: orgShifts } = useGetOrgShiftTimeDataQuery(
    { tenantId },
    { skip: !tenantId },
  );

  // One call → gets kpi + zoneViolations + recentViolations together
  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetZoneOccupancyMonitoringDataQuery();

  const [fetchDetailedReportApi, { isFetching: detailedReportLoading }] =
    useLazyGetZoneOccupancyMonitoringDetailedReportQuery();

  const [downloadSinglePdf] = useGetZoneOccupancyMonitoringSingleReportPdfMutation();
  const [downloadCsvReport] = useGetZoneOccupancyMonitoringDetailedCsvReportMutation();
  const [downloadPdfReport] = useGetZoneOccupancyMonitoringDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (!tenantId) return;
    const loadInitial = async () => {
      const data = await fetchOverviewData({ tenantId }).unwrap();
      setDisplayKpi(data?.kpi ?? []);
      setDisplayZoneViolations(data?.zoneViolations ?? []);
      setRecentViolationsLive(data?.recentViolations ?? []);
      setZoneOccupancyTrendData(mapChartData(data?.chartData));
    };
    loadInitial().catch(console.error);
  }, [tenantId, fetchOverviewData]);

  /* ---------- DETAILED REPORT — re-fetches on page / filter change ---------- */
  useEffect(() => {
    if (!tenantId) return;
    const loadDetailedReport = async () => {
      const alarmValue =
        filters?.alarmTriggered === undefined
          ? undefined
          : filters.alarmTriggered === "True";

      const body = {
        tenantId,
        page: page + 1,
        limit,
        zone: filters?.zone || undefined,
        camera: filters?.camera || undefined,
        alarmTriggered: alarmValue,
        startDate: formatLocalDateTime(filters?.startDate),
        endDate: formatLocalDateTime(filters?.endDate),
      };
      const response = await fetchDetailedReportApi(body).unwrap();
      setDetailedReport(response);
    };
    loadDetailedReport().catch(console.error);
  }, [tenantId, page, limit, filters, fetchDetailedReportApi]);

  /* ---------- SOCKET — only active in live mode ---------- */
  useSocketEvent<ZoneOccupancyMonitoringSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.ZONE_OCCUPANCY_MONITORING_UPDATE,
    handler: (payload) => {
      console.log("zone occupancy monitoring socket", payload);
      setDisplayKpi(payload.kpi ?? []);
      setDisplayZoneViolations(payload.zoneViolations ?? []);
      setRecentViolationsLive(payload.recentViolations ?? []);
      setZoneOccupancyTrendData(mapChartData(payload.chartData));
    },
  });

  /* ---------- TIME FILTER — updates overview only, not the report table ---------- */
  const handleRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        // Range cleared → resume live mode
        setIsLiveMode(true);
        const data = await fetchOverviewData({ tenantId }).unwrap();
        setDisplayKpi(data?.kpi ?? []);
        setDisplayZoneViolations(data?.zoneViolations ?? []);
        setRecentViolationsLive(data?.recentViolations ?? []);
        setZoneOccupancyTrendData(mapChartData(data?.chartData));
        return;
      }

      // Range selected → freeze socket, fetch historical data
      setIsLiveMode(false);
      const data = await fetchOverviewData({
        tenantId,
        startDate: range.start,
        endDate: range.end,
      }).unwrap();
      setDisplayKpi(data?.kpi ?? []);
      setDisplayZoneViolations(data?.zoneViolations ?? []);
      setRecentViolationsLive(data?.recentViolations ?? []);
      setZoneOccupancyTrendData(mapChartData(data?.chartData));
    },
    [tenantId, fetchOverviewData],
  );

  /* ---------- DERIVED DATA ---------- */

  const zoneOccupancyKpiData = useMemo(() => {
    return displayKpi.map((item) => {
      const config = ZoneOccupancyMonitoringKpiConfig[item.title];
      return {
        ...item,
        rawTitle: item.title,
        title: t(item.title),
        value: item.value,
        icon: config?.icon || EngineeringIcon,
        tooltipMessage: config?.tooltipMessage,
      };
    });
  }, [displayKpi, t]);

  // Location/time metrics get the "info" tint; violation counts get red — matches the mockup.

  const zoneOccupancyBreakdownMetrics: BreakdownMetric[] = useMemo(
    () =>
      zoneOccupancyKpiData.map((kpi) => {
        let tone: BreakdownMetric["tone"] = "red";

        if (kpi.rawTitle === "Last Incidence") {
          tone = "info";
        } else if (
          kpi.rawTitle === "Total Occupancy Violations" ||
          kpi.rawTitle === "Peak Occupancy Count"
        ) {
          tone = Number(kpi.value) === 0 ? "green" : "red";
        }

        return {
          icon: kpi.icon,
          value: kpi.value,
          label: kpi.title,
          tone,
          valueFontSize: kpi.rawTitle === "Last Incidence" ? 13 : undefined,
        };
      }),
    [zoneOccupancyKpiData],
  );
  const mapChartData = (chartData: ZoneOccupancyChartDataPoint[] = []) =>
    chartData.map((item) => ({
      date: item.label,
      value: item.totalViolations,
    }));
  const zoneViolationsForUi = useMemo(() => {
    return displayZoneViolations.map((z) => ({
      zone: z.zone,
      violations: z.incidentCount,
    }));
  }, [displayZoneViolations]);

  /* ---------- TABLE CONFIG ---------- */
  const tableColumns = [
    { id: "violation", label: "Violation", minWidth: 200 },
    { id: "occupancyCount", label: "Occupancy Count", minWidth: 120 },
    { id: "time", label: "Time", minWidth: 150 },
    { id: "zone", label: "Zone", minWidth: 150 },
    { id: "camera", label: "Cameras", minWidth: 120 },
    { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
  ];

  const tableFilters = [
    {
      id: "zone",
      label: "Zone",
      type: "select" as const,
      options: detailedReport?.zones || [],
    },
    {
      id: "camera",
      label: "Cameras",
      type: "select" as const,
      options: detailedReport?.cameras || [],
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

  /* ---------- HANDLERS ---------- */
  const handleSubmitFilter = useCallback(
    (newFilters: ZoneOccupancyMonitoringFilterParams) => {
      setPage(0);
      setFilters(newFilters);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  const handleExport = useCallback(
    async (
      format: "csv" | "pdf",
      exportFilters: ZoneOccupancyMonitoringFilterParams,
    ) => {
      try {
        setIsExporting(true);
        const payload = {
          tenantId,
          zone: exportFilters.zone || undefined,
          camera: exportFilters.camera || undefined,
          startDate: formatLocalDateTime(exportFilters.startDate),
          endDate: formatLocalDateTime(exportFilters.endDate),
        };

        if (format === "csv") await downloadCsvReport(payload);
        if (format === "pdf") await downloadPdfReport(payload).unwrap();
      } catch (error) {
        console.error("❌ Export failed:", error);
      } finally {
        setIsExporting(false);
      }
    },
    [tenantId, downloadCsvReport, downloadPdfReport],
  );

  const handleDownloadSingle = useCallback(
    async (
      row: ZoneOccupancyMonitoringRecentViolation,
      index: number,
    ) => {
      try {
        setDownloadingRows((prev) => new Set(prev).add(index));
        await downloadSinglePdf({
          tenantId,
          violation: String(row.violation),
          occupancyCount: String(row.occupancyCount ?? ""),
          zone: row.zone,
          camera: row.camera,
          imageUrl: row.imageUrl,
          time: row.time,
          alarmTriggered: row.alarmTriggered,
        });
      } catch (error) {
        console.error("❌ Single PDF download failed", error);
      } finally {
        setDownloadingRows((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }
    },
    [tenantId, downloadSinglePdf],
  );

  const handleViewSingle = useCallback(
    (row: ZoneOccupancyMonitoringRecentViolation) => {
      setViewPopupData(row);
      setViewPopupOpen(true);
    },
    [],
  );

  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const v = violation as ZoneOccupancyMonitoringRecentViolation;
    try {
      await downloadSinglePdf({
        tenantId,
        violation: String(v.violation),
        occupancyCount: String(v.occupancyCount ?? ""),
        zone: v.zone,
        camera: v.camera,
        imageUrl: url,
        time: v.time,
        alarmTriggered: v.alarmTriggered,
      });
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  /* ---------- RENDER ---------- */

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
              <ViolationBreakdown
                metrics={zoneOccupancyBreakdownMetrics}
              />
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
              <ViolationsTrend
                data={zoneOccupancyTrendData}
                trendPercentage={18}
              />
            </Box>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <CollapsibleTimeFilter
              onRangeChange={handleRangeChange}
              shifts={orgShifts || []}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label={t("Recent Violations")}
              violations={recentViolationsLive}
              loading={overviewLoading}
              tooltipMessage="Latest 20 detected zone occupancy incidents with details."
              onDownload={handleDownloadViolation}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label={t("Zone Violations")}
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows zone occupancy incidents per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report Table */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed zone occupancy monitoring report with filter, reset, and CSV/PDF download options."
        data={detailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(
            row as ZoneOccupancyMonitoringRecentViolation,
            index,
          )
        }
        downloadingRows={downloadingRows}
        onView={(row) =>
          handleViewSingle(row as ZoneOccupancyMonitoringRecentViolation)
        }
        downloadFileName="zone-occupancy-monitoring-report"
        loading={detailedReportLoading}
        totalCount={detailedReport?.total || 0}
        page={page}
        rowsPerPage={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(rows) => {
          setLimit(rows);
          setPage(0);
        }}
      />

      <ViewAlertPopup
        open={viewPopupOpen}
        handleClose={() => setViewPopupOpen(false)}
        details={viewPopupData}
        imageKey="imageUrl"
        onDownload={(url) => {
          if (!viewPopupData) return;
          handleDownloadViolation(url, viewPopupData);
        }}
      />
    </Box>
  );
};

export default ZoneOccupancyMonitoring;
