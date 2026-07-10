


"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { Groups } from "@mui/icons-material";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import {
  
  useGetOrgShiftTimeEmpCriticalDataQuery,
  useGetEmployeePresenceCriticalAreaDetailedCsvReportMutation,
  useGetEmployeePresenceCriticalAreaDetailedPdfReportMutation,
  useGetEmployeePresenceCriticalAreaSingleReportPdfMutation,
  useLazyGetEmployeePresenceCriticalAreaDataQuery,
  useLazyGetEmployeePresenceCriticalAreaDetailedReportQuery,
} from "./EmployeePresenceCriticalAreaApi";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import { EmployeePresenceCriticalAreaKpiConfig } from "./EmployeePresenceCriticalAreaConfig";
import {
  EmployeePresenceCriticalAreaDetailedReportResponse,
  EmployeePresenceCriticalAreaFilterParams,
  EmployeePresenceCriticalAreaViolation,
  EmployeePresenceCriticalAreaKpiItem,
  EmployeePresenceCriticalAreaZoneViolation,
  EmployeePresenceCriticalAreaSocketPayload,
} from "./EmployeePresenceCriticalArea.types";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";

const EmployeePresence: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [filters, setFilters] =
    useState<EmployeePresenceCriticalAreaFilterParams>({});
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<EmployeePresenceCriticalAreaViolation | null>(null);

  // Live mode flag — false when time filter range is active
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Overview display state — fed by initial fetch, time filter fetch, OR socket
  const [displayKpi, setDisplayKpi] = useState<EmployeePresenceCriticalAreaKpiItem[]>([]);
  const [displayZoneViolations, setDisplayZoneViolations] = useState<EmployeePresenceCriticalAreaZoneViolation[]>([]);
  const [recentViolationsLive, setRecentViolationsLive] = useState<EmployeePresenceCriticalAreaViolation[]>([]);

  const [detailedReport, setDetailedReport] =
    useState<EmployeePresenceCriticalAreaDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */
  const { data: orgShifts } =
    useGetOrgShiftTimeEmpCriticalDataQuery(
      { tenantId },
      { skip: !tenantId },
    );

  // One call → gets kpi + zoneViolations + recentViolations together
  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetEmployeePresenceCriticalAreaDataQuery();

  const [fetchDetailedReportApi, { isFetching: detailedReportLoading }] =
    useLazyGetEmployeePresenceCriticalAreaDetailedReportQuery();

  const [downloadSinglePdf] =
    useGetEmployeePresenceCriticalAreaSingleReportPdfMutation();
  const [downloadCsvReport] =
    useGetEmployeePresenceCriticalAreaDetailedCsvReportMutation();
  const [downloadPdfReport] =
    useGetEmployeePresenceCriticalAreaDetailedPdfReportMutation();

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
        filters?.alarmTriggered === undefined
          ? undefined
          : filters.alarmTriggered === "True";

      const body = {
        tenantId,
        page: page + 1,
        limit,
        zone: filters?.zone || undefined,
        cameraName: filters?.camera|| undefined,
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
  useSocketEvent<EmployeePresenceCriticalAreaSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.EMPLOYEE_PRESENCE_DETECTION_IN_CRITICAL_AREAS_UPDATE,
    handler: (payload) => {
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
      const config = EmployeePresenceCriticalAreaKpiConfig[item.title];
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
    (newFilters: EmployeePresenceCriticalAreaFilterParams) => {
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
    async (format: "csv" | "pdf", exportFilters: EmployeePresenceCriticalAreaFilterParams) => {
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
    async (row: EmployeePresenceCriticalAreaViolation, index: number) => {
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
    (row: EmployeePresenceCriticalAreaViolation) => {
      setViewPopupData(row);
      setViewPopupOpen(true);
    },
    [],
  );

  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const v = violation as EmployeePresenceCriticalAreaViolation;
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
            ? Array.from({ length: 6 }).map((_, index) => (
                <Grid key={`skeleton-${index + 1}`} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
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
              tooltipMessage="Latest 20 violations where employee entered in critical areas with details."
              violations={recentViolationsLive}
              loading={overviewLoading}
              onDownload={handleDownloadViolation}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows employee entered in critical zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report Table */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        data={detailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(row as EmployeePresenceCriticalAreaViolation, index)
        }
        downloadingRows={downloadingRows}
        onView={(row) => handleViewSingle(row as EmployeePresenceCriticalAreaViolation)}
        downloadFileName="employee-presence-critical-report"
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

export default EmployeePresence;
