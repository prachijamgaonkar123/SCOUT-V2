
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import { Groups } from "@mui/icons-material";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";

import {
  useGetOrgShiftTimeUnauthorizedAccessInRestrictedAreasDataQuery,
  useGetUnauthorizedAccessInRestrictedAreasDetailedCsvReportMutation,
  useGetUnauthorizedAccessInRestrictedAreasDetailedPdfReportMutation,
  useGetUnauthorizedAccessInRestrictedAreasSingleReportPdfMutation,
  useLazyGetUnauthorizedAccessInRestrictedAreasDataQuery,        // ← single lazy: returns { kpi, zoneViolations, recentViolations }
  useLazyGetUnauthorizedAccessInRestrictedAreasDetailedReportQuery,
} from "./UnauthorizedAccessInRestrictedAreasApi";
import { UnauthorizedAccessConfig } from "./UnauhtorizedAccessInRestrictedAreaConfig";
import {
  KpiTitle,
  UnauthorizedAccessInRestrictedAreasDetailedReportResponse,
  UnauthorizedAccessInRestrictedAreasFilterParams,
  UnauthorizedAccessInRestrictedAreasViolation,
  UnauthorizedAccessInRestrictedAreasKpiItem,
  UnauthorizedAccessInRestrictedAreasZoneViolation,
  UnauthorizedAccessInRestrictedAreasSocketPayload,
} from "./UnauthorizedAccessInRestrictedAreas.types";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";

const UnauthorizedAccessInRestrictedAreas: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [unauthorizedAccessFilters, setUnauthorizedAccessFilters] =
    useState<UnauthorizedAccessInRestrictedAreasFilterParams>({});
  const [unauthorizedAccessPage, setUnauthorizedAccessPage] = useState(0);
  const [unauthorizedAccessLimit, setUnauthorizedAccessLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<UnauthorizedAccessInRestrictedAreasViolation | null>(null);

  // Live mode flag — false when time filter range is active
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Overview display state — fed by initial fetch, time filter fetch, OR socket
  const [displayKpi, setDisplayKpi] = useState<UnauthorizedAccessInRestrictedAreasKpiItem[]>([]);
  const [displayZoneViolations, setDisplayZoneViolations] = useState<UnauthorizedAccessInRestrictedAreasZoneViolation[]>([]);
  const [recentViolationsLive, setRecentViolationsLive] = useState<UnauthorizedAccessInRestrictedAreasViolation[]>([]);

  const [detailedReport, setDetailedReport] =
    useState<UnauthorizedAccessInRestrictedAreasDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */
  const { data: orgShifts } =
    useGetOrgShiftTimeUnauthorizedAccessInRestrictedAreasDataQuery(
      { tenantId },
      { skip: !tenantId },
    );

  // One call → gets kpi + zoneViolations + recentViolations together
  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetUnauthorizedAccessInRestrictedAreasDataQuery();

  const [fetchDetailedReportApi, { isFetching: detailedReportLoading }] =
    useLazyGetUnauthorizedAccessInRestrictedAreasDetailedReportQuery();

  const [downloadSinglePdf] =
    useGetUnauthorizedAccessInRestrictedAreasSingleReportPdfMutation();
  const [downloadCsvReport] =
    useGetUnauthorizedAccessInRestrictedAreasDetailedCsvReportMutation();
  const [downloadPdfReport] =
    useGetUnauthorizedAccessInRestrictedAreasDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (!tenantId) return;
    const loadInitial = async () => {
      const data = await fetchOverviewData({ tenantId }).unwrap();
      setDisplayKpi(data?.kpi ?? []);
      setDisplayZoneViolations(data?.zoneViolations ?? []);
      setRecentViolationsLive(data?.recentViolations ?? []);
    };
    loadInitial().catch(console.error);
  }, [tenantId, fetchOverviewData]);

  /* ---------- DETAILED REPORT — re-fetches on page / filter change ---------- */
  useEffect(() => {
    if (!tenantId) return;
    const loadDetailedReport = async () => {
      const alarmValue =
        unauthorizedAccessFilters?.alarmTriggered === undefined
          ? undefined
          : unauthorizedAccessFilters.alarmTriggered === "True";

      const body = {
        tenantId,
        page: unauthorizedAccessPage + 1,
        limit: unauthorizedAccessLimit,
        zone: unauthorizedAccessFilters?.zone || undefined,
        cameraName: unauthorizedAccessFilters?.cameraName || undefined,
        alarmTriggered: alarmValue,
        startDate: formatLocalDateTime(unauthorizedAccessFilters?.startDate),
        endDate: formatLocalDateTime(unauthorizedAccessFilters?.endDate),
      };
      const response = await fetchDetailedReportApi(body).unwrap();
      setDetailedReport(response);
    };
    loadDetailedReport().catch(console.error);
  }, [
    tenantId,
    unauthorizedAccessPage,
    unauthorizedAccessLimit,
    unauthorizedAccessFilters,
    fetchDetailedReportApi,
  ]);

  /* ---------- SOCKET — only active in live mode ---------- */
  useSocketEvent<UnauthorizedAccessInRestrictedAreasSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.UNAUTHORIZED_ACCESS_IN_RESTRICTED_AREAS_UPDATE,
    handler: (payload) => {
      // Payload shape is identical to the API response: { kpi, zoneViolations, recentViolations }
      setDisplayKpi(payload.kpi ?? []);
      setDisplayZoneViolations(payload.zoneViolations ?? []);
      setRecentViolationsLive(payload.recentViolations ?? []);
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
    },
    [tenantId, fetchOverviewData],
  );

  /* ---------- DERIVED DATA ---------- */
  const kpiData = useMemo(() => {
    return displayKpi.map((item) => {
const config = UnauthorizedAccessConfig[item.title];
      return {
        title: item.title,
        value: item.value,
        icon: config?.icon || Groups,
        tooltipMessage: config?.tooltipMessage,
      };
    });
  }, [displayKpi]);

  const zoneViolationsForUi = useMemo(
    () => displayZoneViolations.map((z) => ({ zone: z.zone, violation: z.violations })),
    [displayZoneViolations],
  );

  /* ---------- TABLE CONFIG ---------- */
  const tableColumns = [
    { id: "violation", label: "Violation" },
    { id: "time", label: "Time" },
    { id: "zone", label: "Zone" },
    { id: "camera", label: "Cameras" },
    { id: "alarmTriggered", label: "Alarm Triggered" },
  ];

  const tableFilters = [
    { id: "zone", label: "Zone", type: "select" as const, options: detailedReport?.zones || [] },
    { id: "camera", label: "Cameras", type: "select" as const, options: detailedReport?.cameras || [] },
    { id: "alarmTriggered", label: "Alarm Triggered", type: "select" as const, options: ["True", "False"] },
    { id: "startDate", label: "Start Date", type: "date" as const },
    { id: "endDate", label: "End Date", type: "date" as const },
  ];

  /* ---------- HANDLERS ---------- */
  const handleSubmitFilter = useCallback(
    (filters: UnauthorizedAccessInRestrictedAreasFilterParams) => {
      setUnauthorizedAccessPage(0);
      setUnauthorizedAccessFilters(filters);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setUnauthorizedAccessFilters({});
    setUnauthorizedAccessPage(0);
  }, []);


  const handleExport = useCallback(
    async (format: "csv" | "pdf", filters: UnauthorizedAccessInRestrictedAreasFilterParams) => {
      try {
        setIsExporting(true);
        const payload = {
          tenantId,
          zone: filters.zone || undefined,
          camera: filters.cameraName || undefined,
          startDate: formatLocalDateTime(filters.startDate),
          endDate: formatLocalDateTime(filters.endDate),
        };

        // ================= CSV =================
        if (format === "csv") {
          await downloadCsvReport(payload);
        }

        // ================= PDF =================
        if (format === "pdf") {
          await downloadPdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      }finally{
        setIsExporting(false);
      }
    },
    [
      tenantId,
      downloadCsvReport,
      downloadPdfReport,
      formatLocalDateTime,
    ],
  );
  const handleDownloadSingle = useCallback(
    async (row: UnauthorizedAccessInRestrictedAreasViolation, index: number) => {
      try {
        setDownloadingRows((prev) => new Set(prev).add(index));
        await downloadSinglePdf({
          tenantId,
          violation: String(row.violation),
          zone: row.zone,
          time: row.time,
          camera: row.camera,
          imageUrl: row.imageUrl,
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
    (row: UnauthorizedAccessInRestrictedAreasViolation) => {
      setViewPopupData(row);
      setViewPopupOpen(true);
    },
    [],
  );

  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const v = violation as UnauthorizedAccessInRestrictedAreasViolation;
    try {
      await downloadSinglePdf({
        tenantId,
        violation: String(v.violation),
        zone: v.zone,
        time: v.time,
        camera: v.camera,
        imageUrl: url,
        alarmTriggered: v.alarmTriggered,
      });
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4, backgroundColor: "#ffffff", borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
            📊 Overview
          </Typography>
          <TimeFilter onRangeChange={handleRangeChange} shifts={orgShifts || []} />
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {overviewLoading || !kpiData.length
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                  <KpiCardSkeleton />
                </Grid>
              ))
            : kpiData.map((kpi) => (
                <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                  <KpiCard {...kpi} />
                </Grid>
              ))}
        </Grid>

        {/* Recent Violations + Zone Violations */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Violations"
              tooltipMessage="Latest 20 detected unauthorized access incidents with details."
              violations={recentViolationsLive}
              loading={overviewLoading}
              onDownload={handleDownloadViolation}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows unauthorized access incidents per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report Table */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed unauthorized access report with filter, reset, and CSV/PDF download options."
        data={detailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(row as UnauthorizedAccessInRestrictedAreasViolation, index)
        }
        downloadingRows={downloadingRows}
        onView={(row) => handleViewSingle(row as UnauthorizedAccessInRestrictedAreasViolation)}
        downloadFileName="unauthorized-access-report"
        loading={detailedReportLoading}
        totalCount={detailedReport?.total || 0}
        page={unauthorizedAccessPage}
        rowsPerPage={unauthorizedAccessLimit}
        onPageChange={(newPage) => setUnauthorizedAccessPage(newPage)}
        onRowsPerPageChange={(rows) => {
          setUnauthorizedAccessLimit(rows);
          setUnauthorizedAccessPage(0);
        }}
      />

      {/* View Alert Popup */}
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

export default UnauthorizedAccessInRestrictedAreas;