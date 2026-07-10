
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { People } from "@mui/icons-material";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import {
  useGetOrgShiftTimeDataQuery,
  useGetPeopleCountDetailedCsvReportMutation,
  useGetPeopleCountDetailedPdfReportMutation,
  useGetPeopleCountSingleReportPdfMutation,
  useLazyGetPeopleCountDataQuery,
  useLazyGetPeopleCountDetailedReportQuery,
} from "./PeopleCountApi";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import { PeopleCountKpiConfig } from "./PeopleCountConfig";
import {
  KpiTitle,
  PeopleCountDetailedReportResponse,
  PeopleCountFilterParams,
  PeopleCountViolation,
  PeopleCountKpiItem,
  PeopleCountZoneViolation,
  PeopleCountSocketPayload,
  KpiColour,
} from "./PeopleCount.types";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const PeopleCount: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [filters, setFilters] = useState<PeopleCountFilterParams>({});
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<PeopleCountViolation | null>(null);

  // Live mode flag — false when time filter range is active
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Overview display state — fed by initial fetch, time filter fetch, OR socket
  const [displayKpi, setDisplayKpi] = useState<PeopleCountKpiItem[]>([]);
  const [displayZoneViolations, setDisplayZoneViolations] = useState<PeopleCountZoneViolation[]>([]);
  const [recentViolationsLive, setRecentViolationsLive] = useState<PeopleCountViolation[]>([]);

  const [detailedReport, setDetailedReport] =
    useState<PeopleCountDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */
  const { data: orgShifts } = useGetOrgShiftTimeDataQuery(
    { tenantId },
    { skip: !tenantId },
  );

  // One call → gets kpi + zoneViolations + recentViolations together
  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetPeopleCountDataQuery();

  const [fetchDetailedReportApi, { isFetching: detailedReportLoading }] =
    useLazyGetPeopleCountDetailedReportQuery();

  const [downloadSinglePdf] = useGetPeopleCountSingleReportPdfMutation();
  const [downloadCsvReport] = useGetPeopleCountDetailedCsvReportMutation();
  const [downloadPdfReport] = useGetPeopleCountDetailedPdfReportMutation();

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
  useSocketEvent<PeopleCountSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.PEOPLE_COUNT_UPDATE,
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
      const config = PeopleCountKpiConfig[item.title ];
      return {
        title: item.title,
        value: item.value,
        icon: config?.icon || People,
        tooltipMessage: config?.tooltipMessage,
      colour: config?.colour as KpiColour,  
      };
    });
  }, [displayKpi]);
const zoneViolationsForUi = useMemo(() => {
  return displayZoneViolations.map((z) => ({
    zone: z.zone,
    subViolations: [
      { label: "Entered Count", value: z.entryCount, icon: PeopleIcon },
      { label: "Exit Count",  value: z.exitCount,  icon: ExitToAppIcon },
    ],
  }));
}, [displayZoneViolations]);

  /* ---------- TABLE CONFIG ---------- */
  const tableColumns = [
    { id: "violation", label: "Violation", minWidth: 200 },
    { id: "enteredCount", label: "Entered Count", minWidth: 140 },
    { id: "exitCount", label: "Exit Count", minWidth: 120 },
    { id: "time", label: "Time", minWidth: 120 },
    { id: "zone", label: "Zone", minWidth: 120 },
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
    (newFilters: PeopleCountFilterParams) => {
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
    async (format: "csv" | "pdf", exportFilters: PeopleCountFilterParams) => {
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
    async (row: PeopleCountViolation, index: number) => {
      try {
        setDownloadingRows((prev) => new Set(prev).add(index));
        await downloadSinglePdf({
          tenantId,
          violation: String(row.violation),
          enteredCount: row.enteredCount as number,
          exitCount: row.exitCount as number,
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

  const handleViewSingle = useCallback((row: PeopleCountViolation) => {
    setViewPopupData(row);
    setViewPopupOpen(true);
  }, []);

  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const v = violation as PeopleCountViolation;
    try {
      await downloadSinglePdf({
        tenantId,
        violation: String(v.violation),
        enteredCount: v.enteredCount as number,
        exitCount: v.exitCount as number,

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
      <Paper
        sx={{ p: 3, mb: 4, backgroundColor: "#ffffff", borderRadius: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
            📊 Overview
          </Typography>
          <TimeFilter onRangeChange={handleRangeChange} shifts={orgShifts || []} />
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {overviewLoading || !kpiData.length
            ? Array.from({ length: 3 }).map((_, i) => (
              <Grid  key={`skeleton-${i + 1}`} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
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
              tooltipMessage="Latest 20 People Count in Factory Premises based on Entry Exit person Count with details."
              violations={recentViolationsLive}
              loading={overviewLoading}
              onDownload={handleDownloadViolation}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows person entry and exit count per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report Table */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed person entry and exit report with filter, reset, and CSV/PDF download options."
        data={detailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(row as PeopleCountViolation, index)
        }
        downloadingRows={downloadingRows}
        onView={(row) => handleViewSingle(row as PeopleCountViolation)}
        downloadFileName="people-count-report"
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

export default PeopleCount;