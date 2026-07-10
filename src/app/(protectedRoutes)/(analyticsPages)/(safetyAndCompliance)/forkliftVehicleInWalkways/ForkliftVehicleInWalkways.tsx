
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import {
  useGetOrgShiftTimeDataQuery,
  useGetForkliftVehicleInWalkwaysSingleReportPdfMutation,
  useGetForkliftVehicleInWalkwaysDetailedCsvReportMutation,
  useGetForkliftVehicleInWalkwaysDetailedPdfReportMutation,
  useLazyGetForkliftVehicleInWalkwaysDataQuery,
  useLazyGetForkliftVehicleInWalkwaysDetailedReportQuery,
} from "./ForkliftVehicleInWalkwaysApi";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import { ForklifVehicleInWalkwaysKpiConfig } from "./ForkliftVehicleInWalkways.config";
import {
  KpiColour,
  ForklifVehicleInWalkwaysKpiItem,
  ForklifVehicleInWalkwaysFilterParams,
  ForklifVehicleInWalkwaysRecentViolation,
  ForklifVehicleInWalkwaysSocketPayload,
  forkliftVehicleInWalkwaysDetailedReportResponse,
  ForklifVehicleInWalkwaysZoneViolation,
} from "./ForkliftVehicleInWalkways.types";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { DirectionsCar, SvgIconComponent } from "@mui/icons-material";
import ForkliftIcon from "@mui/icons-material/Forklift";

const ObjectDetection: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [filters, setFilters] = useState<ForklifVehicleInWalkwaysFilterParams>({});
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<ForklifVehicleInWalkwaysRecentViolation | null>(null);

  // Live mode flag — false when time filter range is active
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Overview display state — fed by initial fetch, time filter fetch, OR socket
const [displayKpi, setDisplayKpi] = useState<ForklifVehicleInWalkwaysKpiItem[]>([]);

const [displayZoneViolations, setDisplayZoneViolations] = useState<
  ForklifVehicleInWalkwaysZoneViolation[]
>([]);
const [recentViolationsLive, setRecentViolationsLive] = useState<ForklifVehicleInWalkwaysRecentViolation[]>([]);
  const [detailedReport, setDetailedReport] =
    useState<forkliftVehicleInWalkwaysDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */
  const { data: orgShifts } = useGetOrgShiftTimeDataQuery(
    { tenantId },
    { skip: !tenantId },
  );

  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetForkliftVehicleInWalkwaysDataQuery();

  const [fetchDetailedReportApi, { isFetching: detailedReportLoading }] =
    useLazyGetForkliftVehicleInWalkwaysDetailedReportQuery();

  const [downloadSinglePdf] = useGetForkliftVehicleInWalkwaysSingleReportPdfMutation();
  const [downloadCsvReport] = useGetForkliftVehicleInWalkwaysDetailedCsvReportMutation();
  const [downloadPdfReport] = useGetForkliftVehicleInWalkwaysDetailedPdfReportMutation();

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
        objectName: filters?.objectName || undefined,
  walkway: filters?.walkway || undefined,

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
  useSocketEvent<ForklifVehicleInWalkwaysSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.FORKLIFT_VEHICLE_IN_WALKWAYS_UPDATE,
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
      const config = ForklifVehicleInWalkwaysKpiConfig[item.title];
      return {
        title: item.title,
        value: item.value,
        icon: config?.icon,
        tooltipMessage: config?.tooltipMessage,
        colour: item.color,
      };
    });
  }, [displayKpi]);
const zoneViolationsForUi = useMemo(() => {
  const iconMap: Record<string, SvgIconComponent> = {
    forklift: ForkliftIcon,
    vehicle: DirectionsCar,
  };

  return displayZoneViolations.map((z) => ({
    ...z,
    subViolations: z.subViolations?.map((s) => ({
      ...s,
      icon: iconMap[s.label],
    })),
  }));
}, [displayZoneViolations]);
  /* ---------- TABLE CONFIG ---------- */
  const tableColumns = [
    { id: "violation", label: "Violation", minWidth: 150 },
    { id: "objectName", label: "Object Name", minWidth: 120 },
    { id: "time", label: "Time", minWidth: 150 },
      { id: "walkway", label: "Walkway", minWidth: 120 },   // ← add this

    { id: "zone", label: "Zone", minWidth: 120 },
    { id: "camera", label: "Camera", minWidth: 120 },
    { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 120 },
  ];

  const tableFilters = [
     {
      id: "objectName",
      label: "Object Name",
      type: "select" as const,
      options: detailedReport?.objectNames || [],
    },
     {
      id: "walkway",
      label: "Walkway",
      type: "select" as const,
      options: detailedReport?.walkways || [],
    },
    {
      id: "zone",
      label: "Zone",
      type: "select" as const,
      options: detailedReport?.zones || [],
    },
    {
      id: "camera",
      label: "Camera",
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
    (newFilters: ForklifVehicleInWalkwaysFilterParams) => {
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
      exportFilters: ForklifVehicleInWalkwaysFilterParams,
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
      row: ForklifVehicleInWalkwaysRecentViolation,
      index: number,
    ) => {
      try {
        setDownloadingRows((prev) => new Set(prev).add(index));
        await downloadSinglePdf({
          tenantId,
          violation: String(row.violation),
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
    (row: ForklifVehicleInWalkwaysRecentViolation) => {
      setViewPopupData(row);
      setViewPopupOpen(true);
    },
    [],
  );

  const handleDownloadViolation = async (
    url: string,
    violation: Violation,
  ) => {
    if (!violation) return;
    const v = violation as ForklifVehicleInWalkwaysRecentViolation;
    try {
      await downloadSinglePdf({
        tenantId,
        violation: String(v.violation),
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
      <Paper sx={{ p: 2.2, mb: 4, backgroundColor: "#ffffff", borderRadius: 2 }}>
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
          <TimeFilter
            onRangeChange={handleRangeChange}
            shifts={orgShifts || []}
          />
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {overviewLoading || !kpiData.length
            ? Array.from({ length: 3 }).map((_, i) => (
                <Grid
                  key={`skeleton-${i + 1}`}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                >
                  <KpiCardSkeleton />
                </Grid>
              ))
            : kpiData.map((kpi) => (
                <Grid
                  key={kpi.title}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                >
                  <KpiCard {...kpi} />
                </Grid>
              ))}
        </Grid>

        {/* Recent Violations + Zone Violations */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Violations"
              tooltipMessage="Latest 20 Forklift / Vehicle detected in Walkways with details."
              violations={recentViolationsLive}
              loading={overviewLoading}
              onDownload={handleDownloadViolation}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report Table */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed detection events for forklifts/vehicles in walkways with filter, reset, and export options."
        data={detailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(
            row as ForklifVehicleInWalkwaysRecentViolation,
            index,
          )
        }
        downloadingRows={downloadingRows}
        onView={(row) =>
          handleViewSingle(row as ForklifVehicleInWalkwaysRecentViolation)
        }
        downloadFileName="forklift-vehicle-detection-report"
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

export default ObjectDetection;