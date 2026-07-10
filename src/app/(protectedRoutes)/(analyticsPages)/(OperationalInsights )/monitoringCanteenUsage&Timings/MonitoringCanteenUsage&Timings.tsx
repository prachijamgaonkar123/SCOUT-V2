"use client";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import { useCallback, useEffect, useMemo, useState } from "react";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolationsOld";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { CanteenUsageDetailedReportResponse, CanteenUsageFilterParams, CanteenUsageKpiItemUi, CanteenUsageSocketPayload, CanteenUsageViolation, CanteenUsageZoneViolation } from "./monitoringCanteenUsage&Timings.types";
import { useGetCanteenUsageDetailedCsvReportMutation, useGetCanteenUsageDetailedPdfReportMutation, useGetCanteenUsageSingleReportPdfMutation, useGetOrgShiftTimeCanteenUsageDataQuery, useLazyGetCanteenUsageDataQuery, useLazyGetCanteenUsageDetailedReportQuery } from "./monitoringCanteenUsage&TimingsApi";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { canteenUsageFallbackIcon, canteenUsageKpiConfig, canteenUsageSubIconMap } from "./monitoringCanteenUsage&TimingsConfig";

const MonitoringCanteenUsageTimings: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [canteenFilters, setCanteenFilters] = useState<CanteenUsageFilterParams>({});

  const [canteenPage, setCanteenPage] = useState(0);
  const [canteenLimit, setCanteenLimit] = useState(10);

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<CanteenUsageViolation | null>(null);

  const [isCanteenLiveMode, setIsCanteenLiveMode] = useState(true);

  const [displayCanteenKpi, setDisplayCanteenKpi] = useState<
    { title: string; value: string | number }[]
  >([]);

  const [isExporting, setIsExporting] = useState(false); // report loader
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set()); // single report loader

  const [displayCanteenZoneViolations, setDisplayCanteenZoneViolations] =
    useState<CanteenUsageZoneViolation[]>([]);
  const [canteenRecentViolationsLive, setCanteenRecentViolationsLive] =
    useState<CanteenUsageViolation[]>([]);

  const [canteenDetailedReport, setCanteenDetailedReport] =
    useState<CanteenUsageDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */

  const { data: canteenOrgShifts } = useGetOrgShiftTimeCanteenUsageDataQuery(
    { tenantId },
    { skip: !tenantId },
  );

  // One call → gets kpi + zoneViolations + recentViolations together
  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetCanteenUsageDataQuery();

  const [
    fetchCanteenDetailedReportApi,
    { isFetching: canteenDetailedReportLoading },
  ] = useLazyGetCanteenUsageDetailedReportQuery();

  const [downloadCanteenUsageSinglePdf] = useGetCanteenUsageSingleReportPdfMutation();
  const [downloadCanteenUsageCsvReport] = useGetCanteenUsageDetailedCsvReportMutation();
  const [downloadCanteenUsagePdfReport] = useGetCanteenUsageDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */

  useEffect(() => {
    if (!tenantId) return;
    const loadInitial = async () => {
      const data = await fetchOverviewData({ tenantId }).unwrap();
      setDisplayCanteenKpi(data?.kpi ?? []);
      setDisplayCanteenZoneViolations(data?.zoneViolations ?? []);
      setCanteenRecentViolationsLive(data?.recentViolations ?? []);
    };
    loadInitial().catch(console.error);
  }, [tenantId, fetchOverviewData]);

  useEffect(() => {
    if (!tenantId) return;

    const loadDetailedReport = async () => {
      const body = {
        tenantId,
        page: canteenPage + 1,
        limit: canteenLimit,
        usage: canteenFilters?.usage || undefined,
        zone: canteenFilters?.zone || undefined,
        camera: canteenFilters?.camera || undefined,
        startDate: formatLocalDateTime(canteenFilters?.startDate),
        endDate: formatLocalDateTime(canteenFilters?.endDate),
      };

      const response = await fetchCanteenDetailedReportApi(body).unwrap();
      setCanteenDetailedReport(response);
    };

    loadDetailedReport().catch(console.error);
  }, [
    tenantId,
    canteenPage,
    canteenLimit,
    canteenFilters,
    fetchCanteenDetailedReportApi,
  ]);

  /* ---------- SOCKET (LIVE ONLY) ---------- */
  useSocketEvent<CanteenUsageSocketPayload>({
    tenantId,
    enabled: isCanteenLiveMode,
    event: SOCKET_EVENTS.CANTEEN_USAGE_MONITORING_UPDATE,
    handler: (payload) => {
      console.log("payload from the socket", payload);
      setDisplayCanteenKpi(payload.kpi ?? []);
      setDisplayCanteenZoneViolations(payload.zoneViolations ?? []);
      setCanteenRecentViolationsLive(payload.recentViolations ?? []);
    },
  });

  /* ---------- TIME FILTER ---------- */

  const handleCanteenRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        // Range cleared → resume live mode
        setIsCanteenLiveMode(true);
        const data = await fetchOverviewData({ tenantId }).unwrap();
        setDisplayCanteenKpi(data?.kpi ?? []);
        setDisplayCanteenZoneViolations(data?.zoneViolations ?? []);
        setCanteenRecentViolationsLive(data?.recentViolations ?? []);
        return;
      }

      // Range selected → freeze socket, fetch historical data
      setIsCanteenLiveMode(false);
      const data = await fetchOverviewData({
        tenantId,
        startDate: range.start,
        endDate: range.end,
      }).unwrap();
      setDisplayCanteenKpi(data?.kpi ?? []);
      setDisplayCanteenZoneViolations(data?.zoneViolations ?? []);
      setCanteenRecentViolationsLive(data?.recentViolations ?? []);
    },
    [tenantId, fetchOverviewData],
  );

  /* ---------- DERIVED DATA ---------- */

  const canteenKpiData: CanteenUsageKpiItemUi[] = useMemo(() => {
    return displayCanteenKpi.map((item) => {
      const config = canteenUsageKpiConfig[item.title];
      return {
        title: item.title,
        value: item.value,
        icon: config?.icon || canteenUsageFallbackIcon,
        tooltipMessage: config?.tooltipMessage,
      };
    });
  }, [displayCanteenKpi]);

const zoneViolationsForUi = useMemo(() => {
  return displayCanteenZoneViolations.map((z) => ({
    zone: z.zone,
    totalViolations: z.usage,
    subViolations: z.subUsage.map((s) => ({
      label: s.label,
      value: s.value,
      icon: canteenUsageSubIconMap[s.label.toLowerCase()],
    })),
  }));
}, [displayCanteenZoneViolations]);

  /* ---------- REPORT HANDLERS ---------- */

  const tableColumns = [
    { id: "usage", label: t("Canteen Usage") },
        { id: "time", label: t("Time") },

    { id: "count", label: t("Count") },
        { id: "zone", label: t("Zone") },
    { id: "camera", label: t("Camera") },

  ];

  const tableFilters = [
    {
      id: "usage",
      label: t("Usage Type"),
      type: "select" as const,
      options: ["Breakfast", "Lunch", "Dinner"],
    },
    {
      id: "zone",
      label: t("Zone"),
      type: "select" as const,
      options: canteenDetailedReport?.zones || [],
    },
    {
      id: "camera",
      label: t("Cameras"),
      type: "select" as const,
      options: canteenDetailedReport?.cameras || [],
    },
 
    { id: "startDate", label: t("Start Date"), type: "date" as const },
    { id: "endDate", label: t("End Date"), type: "date" as const },
  ];

  const handleSubmitFilter = useCallback((filters: CanteenUsageFilterParams) => {
    setCanteenPage(0); // set page FIRST
    setCanteenFilters(filters); // then filters
  }, []);

  const handleReset = useCallback(() => {
    setCanteenFilters({});
    setCanteenPage(0);
  }, []);

  const handleExport = useCallback(
    async (format: "csv" | "pdf", filters: CanteenUsageFilterParams) => {
      try {
        setIsExporting(true);
        const payload = {
          tenantId,
          usage: filters.usage || undefined,
          zone: filters.zone || undefined,
          camera: filters.camera || undefined,
          startDate: formatLocalDateTime(filters.startDate),
          endDate: formatLocalDateTime(filters.endDate),
        };

        if (format === "csv") {
          await downloadCanteenUsageCsvReport(payload);
        }

        if (format === "pdf") {
          await downloadCanteenUsagePdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      } finally {
        setIsExporting(false);
      }
    },
    [tenantId, downloadCanteenUsageCsvReport, downloadCanteenUsagePdfReport],
  );

  const handleDownloadSingle = useCallback(
    async (row: CanteenUsageViolation, index: number) => {
      try {
        setDownloadingRows((prev) => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        });

        const payload = {
          tenantId,
          usage: String(row.usage ?? "Unknown Usage"),
          zone: row.zone,
          count:row.count,
          time: row.time,
          camera: row.camera ,
          imageUrl: row.imageUrl,
        };

        await downloadCanteenUsageSinglePdf(payload);
      } catch (error) {
        console.error("❌ Single PDF download failed", error);
      } finally {
        setDownloadingRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }
    },
    [tenantId, downloadCanteenUsageSinglePdf],
  );

  const handleViewSingle = useCallback((row: CanteenUsageViolation) => {
    setViewPopupData(row);
    setViewPopupOpen(true);
  }, []);

  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const canteenIncident = violation as CanteenUsageViolation;
    try {
      const payload = {
        tenantId,
        usage: canteenIncident.usage ?? "Unknown Usage",
        zone: canteenIncident.zone,
        count:canteenIncident.count,
        time: canteenIncident.time,
        camera: canteenIncident.camera ,
        imageUrl: url,
      };

      await downloadCanteenUsageSinglePdf(payload);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4, backgroundColor: "#ffffff", borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
            <Box component="span" sx={{ mr: 2 }}>
              📊 {t("Overview")}
            </Box>
          </Typography>

          <TimeFilter
            onRangeChange={handleCanteenRangeChange}
            shifts={canteenOrgShifts || []}
          />
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }} alignItems="stretch">
          {overviewLoading || !canteenKpiData.length
            ? Array.from({ length: 5 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                  <KpiCardSkeleton />
                </Grid>
              ))
            : canteenKpiData.map((kpi) => (
                <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                  <KpiCard {...kpi} />
                </Grid>
              ))}
        </Grid>

        {/* Content Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label={t("Recent Canteen Usage")}
              violations={canteenRecentViolationsLive}
              loading={overviewLoading}
              tooltipMessage="Latest detected canteen usage records with details."
              onDownload={handleDownloadViolation}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label={t("Canteen Usage")}
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows canteen usage per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report */}
      <ReportTable
        title={t("Detailed Report")}
        tooltipMessage="Detailed canteen usage report with filters and export options."
        data={canteenDetailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(row as CanteenUsageViolation, index)
        }
        downloadingRows={downloadingRows}
        onView={(row) => handleViewSingle(row as CanteenUsageViolation)}
        downloadFileName="canteen-usage-report"
        loading={canteenDetailedReportLoading}
        totalCount={canteenDetailedReport?.total || 0}
        page={canteenPage}
        rowsPerPage={canteenLimit}
        onPageChange={(newPage) => setCanteenPage(newPage)}
        onRowsPerPageChange={(rows) => {
          setCanteenLimit(rows);
          setCanteenPage(0);
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

export default MonitoringCanteenUsageTimings;