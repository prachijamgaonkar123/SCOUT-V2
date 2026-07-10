"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";

import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import EngineeringIcon from "@mui/icons-material/Engineering";
import {
  MovemnetDuringShutDownHrDetailedReportResponse,
  MovemnetDuringShutDownHrFilterParams,
  MovemnetDuringShutDownHrKpiItem,
  MovemnetDuringShutDownHrSocketPayload,
  MovemnetDuringShutDownHrViolation,
  MovemnetDuringShutDownHrZoneViolation,
} from "./movementDuringShutdownHours.types";
import {
  useGetMovementDuringShutdownHoursDetailedCsvReportMutation,
  useGetMovementDuringShutdownHoursDetailedPdfReportMutation,
  useGetMovementDuringShutdownHoursSingleReportPdfMutation,
  useGetOrgShiftTimeMovementDataQuery,
  useLazyGetMovementDuringShutdownHoursDetailedReportQuery,
  useLazyGetMovementDuringShutdownHoursKpiQuery,
  useLazyGetMovementDuringShutdownHoursRecentViolationsQuery,
  useLazyGetMovementDuringShutdownHoursZoneViolationsQuery,
} from "./movementDuringShutdownHoursApi";
import { movemnetDuringShutDownHrKpiConfig } from "./movementDuringShutdownHoursConfig";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
const MovementDuringShutdownHours: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";
  /* ---------- STATE ---------- */
  const [movementFilters, setMovementFilters] =
    useState<MovemnetDuringShutDownHrFilterParams>({});
  const [movementPage, setMovementPage] = useState(0);
  const [movementLimit, setMovementLimit] = useState(10);

  const [isMovementLiveMode, setIsMovementLiveMode] = useState(true);

  const [displayMovementKpi, setDisplayMovementKpi] = useState<
    MovemnetDuringShutDownHrKpiItem[]
  >([]);
  const [displayMovementZoneViolations, setDisplayMovementZoneViolations] =
    useState<MovemnetDuringShutDownHrZoneViolation[]>([]);
  const [recentMovementViolationsLive, setRecentMovementViolationsLive] =
    useState<MovemnetDuringShutDownHrViolation[]>([]);
  const [detailedMovementReport, setDetailedMovementReport] =
    useState<MovemnetDuringShutDownHrDetailedReportResponse | null>(null);

  const [viewMovementPopupOpen, setViewMovementPopupOpen] = useState(false);

  const [viewMovementPopupData, setViewMovementPopupData] =
    useState<MovemnetDuringShutDownHrViolation | null>(null);
  const [isExporting, setIsExporting] = useState(false);//report loader
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());//single report loader of report table

  /*-------movement api ----------*/

  const { data: orgShifts } = useGetOrgShiftTimeMovementDataQuery(
    { tenantId },
    { skip: !tenantId },
  );
  const [fetchMovementKpi, { isFetching: movementkpiLoading }] =
    useLazyGetMovementDuringShutdownHoursKpiQuery();

  const [fetchMovementRecent, { isLoading: movementrecentLoading }] =
    useLazyGetMovementDuringShutdownHoursRecentViolationsQuery();

  const [fetchMovementZoneViolations, { isLoading: movementzoneLoading }] =
    useLazyGetMovementDuringShutdownHoursZoneViolationsQuery();

  const [
    fetchDetailedMovementReportApi,
    { isFetching: movementreportLoading },
  ] = useLazyGetMovementDuringShutdownHoursDetailedReportQuery();

  const [downloadMovementSinglePdf] =
    useGetMovementDuringShutdownHoursSingleReportPdfMutation();

  const [downloadMovementCsvReport] =
    useGetMovementDuringShutdownHoursDetailedCsvReportMutation();
  const [downloadMovementPdfReport] =
    useGetMovementDuringShutdownHoursDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (!tenantId) return;

    const loadInitial = async () => {
      const [kpi, zones, recent] = await Promise.all([
        fetchMovementKpi({ tenantId }).unwrap(),
        fetchMovementZoneViolations({ tenantId }).unwrap(),
        fetchMovementRecent({ tenantId }).unwrap(),
      ]);

      setDisplayMovementKpi(kpi ?? []);
      setDisplayMovementZoneViolations(zones ?? []);
      setRecentMovementViolationsLive(recent ?? []);
    };

    loadInitial().catch(console.error);
  }, [
    tenantId,
    fetchMovementKpi,
    fetchMovementZoneViolations,
    fetchMovementRecent,
  ]);

  useEffect(() => {
    if (!tenantId) return;

    const loadDetailedReport = async () => {
      const alarmValue =
        movementFilters?.alarmTriggered === undefined
          ? undefined
          : movementFilters.alarmTriggered === "True";

      const body = {
        tenantId,
        page: movementPage + 1,
        limit: movementLimit,

        zone: movementFilters?.zone || undefined,
        cameraId: movementFilters?.cameraId || undefined,
        alarmTriggered: alarmValue,
        startDate: formatLocalDateTime(movementFilters?.startDate),
        endDate: formatLocalDateTime(movementFilters?.endDate),
      };

      const response = await fetchDetailedMovementReportApi(body).unwrap();

      setDetailedMovementReport(response);
    };

    loadDetailedReport();
  }, [tenantId, movementPage, movementLimit, movementFilters]);
  /* ---------- SOCKET (LIVE ONLY) ---------- */
  useSocketEvent<MovemnetDuringShutDownHrSocketPayload>({
    tenantId,
    enabled: isMovementLiveMode,
    event: SOCKET_EVENTS.MOVEMENT_DURING_SHUTDOWN_HR_UPDATE,
    handler: (payload) => {
      console.log("payload form the socket for movement", payload);
      setDisplayMovementKpi(payload.kpi ?? []);
      setDisplayMovementZoneViolations(payload.zoneViolations ?? []);
      setRecentMovementViolationsLive(payload.recentViolations ?? []);
    },
  });

  /* ---------- TIME FILTER ---------- */
  const handleMovementTimeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        setIsMovementLiveMode(true);

        // ✅ CALL ALL APIs + SET STATE
        const [kpi, zones, recent] = await Promise.all([
          fetchMovementKpi({ tenantId }).unwrap(),
          fetchMovementZoneViolations({ tenantId }).unwrap(),
          fetchMovementRecent({ tenantId }).unwrap(),
        ]);

        setDisplayMovementKpi(kpi ?? []);
        setDisplayMovementZoneViolations(zones ?? []);
        setRecentMovementViolationsLive(recent ?? []);

        return;
      }
      setIsMovementLiveMode(false);
      const payload = {
        tenantId: tenantId,
        startDate: range.start,
        endDate: range.end,
      };
      const [kpi, zones, recent] = await Promise.all([
        fetchMovementKpi(payload).unwrap(),
        fetchMovementZoneViolations(payload).unwrap(),
        fetchMovementRecent(payload).unwrap(),
      ]);

      setDisplayMovementKpi(kpi ?? []);
      setDisplayMovementZoneViolations(zones ?? []);
      setRecentMovementViolationsLive(recent ?? []);
    },
    [
      tenantId,
      fetchMovementKpi,
      fetchMovementZoneViolations,
      fetchMovementRecent,
    ],
  );

  const MovementKpiData = useMemo(
    () =>
      displayMovementKpi.map((item) => {
        const config = movemnetDuringShutDownHrKpiConfig[item.title];

        return {
          ...item,
          title: t(item.title),
          icon: config?.icon || EngineeringIcon,
          tooltipMessage: config?.tooltipMessage || "",
        };
      }),
    [displayMovementKpi, t],
  );
  const MovementZoneViolationsForUi = useMemo(() => {
    return displayMovementZoneViolations.map((z) => ({
      zone: z.zone,
      incident: z.MovementEvents,
    }));
  }, [displayMovementZoneViolations]);
  // recent violation
  const handleDownloadMovementViolation = async (
    url: string,
    violation: Violation,
  ) => {
    if (!violation) return;
    const MovementViolation = violation as MovemnetDuringShutDownHrViolation;
    try {
      const payload = {
        tenantId: tenantId,
        violation: String(
          MovementViolation.incident ?? MovementViolation.violation,
        ),
        zone: MovementViolation.zone,
        time: MovementViolation.time,
        cameraId: MovementViolation.camera ?? MovementViolation.cameraId,
        alarmTriggered: MovementViolation.alarmTriggered,
        imageUrl: url,
        peopleCount: MovementViolation.peopleCount,
      };

      await downloadMovementSinglePdf(payload);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  //detailed report handlers

  const movementTableColumns = [
    { id: "violation", label: t("Incident") },
    { id: "peopleCount", label: t("People Count") },
    { id: "time", label: t("Time") },
    { id: "zone", label: t("Zone") },
    { id: "cameraId", label: t("Cameras") },
    { id: "alarmTriggered", label: t("Alarm Triggered") },
  ];
  const movementTableFilters = [
    {
      id: "zone",
      label: t("Zone"),
      type: "select" as const,

      options: detailedMovementReport?.zones || [],
    },
    {
      id: "cameraId",
      label: t("Cameras"),
      type: "select" as const,

      options: detailedMovementReport?.cameras || [],
    },
    {
      id: "alarmTriggered",
      label: t("Alarm Triggered"),
      type: "select" as const,
      options: ["True", "False"],
    },
    { id: "startDate", label: t("Start Date"), type: "date" as const },
    { id: "endDate", label: t("End Date"), type: "date" as const },
  ];


  const handleMovementSubmitFilter = useCallback(
    (filters: MovemnetDuringShutDownHrFilterParams) => {
      console.log("filter params", filters);
      setMovementPage(0); // ← set page FIRST
      setMovementFilters(filters); // ← then filters
      // React batches both → useEffect fires exactly ONCE
    },
    [], // no deps needed
  );

  const handleMovementReset = useCallback(() => {
    setMovementFilters({});
    setMovementPage(0);
  }, []);

  const handleMovementExport = useCallback(
    async (
      format: "csv" | "pdf",
      filters: MovemnetDuringShutDownHrFilterParams,
    ) => {
      try {
        setIsExporting(true)
        const payload = {
          tenantId,
          zone: filters.zone || undefined,
          cameraId: filters.cameraId || undefined,

          alarmTriggered:
            filters.alarmTriggered === undefined
              ? undefined
              : filters.alarmTriggered === "True",

          startDate: formatLocalDateTime(filters.startDate),
          endDate: formatLocalDateTime(filters.endDate),
        };

        // ================= CSV =================
        if (format === "csv") {
          await downloadMovementCsvReport(payload);
        }

        // ================= PDF =================
        if (format === "pdf") {
          await downloadMovementPdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      } finally {
        setIsExporting(false)
      }
    },
    [
      tenantId,
      downloadMovementCsvReport,
      downloadMovementPdfReport,
      formatLocalDateTime,
    ],
  );

  const handleDownloadMovementSingle = useCallback(
    async (row: MovemnetDuringShutDownHrViolation, index: number) => {
      try {
        setDownloadingRows((prev) => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        });
        const payload = {
          tenantId,
          violation: String(row.incident ?? row.violation),
          zone: row.zone,
          time: row.time,
          cameraId: row.camera ?? row.cameraId,
          alarmTriggered: row.alarmTriggered,
          imageUrl: row.imageUrl,
          peopleCount: row.peopleCount,
        };

        await downloadMovementSinglePdf(payload);
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
    [tenantId, downloadMovementSinglePdf],
  );

  const handleViewMovementSingle = useCallback(
    (row: MovemnetDuringShutDownHrViolation) => {
      console.log("view single row", row);
      setViewMovementPopupData(row);
      setViewMovementPopupOpen(true);
    },
    [],
  );
  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
              <Box component="span" sx={{ mr: 2 }}>
                📊 Overview
              </Box>
            </Typography>
          </Box>

          <TimeFilter
            onRangeChange={handleMovementTimeRangeChange}
            shifts={orgShifts || []}
          />
        </Box>
        {/* KPI Cards */}

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {movementkpiLoading || !MovementKpiData.length
            ? Array.from({ length: 6 }).map((_, index) => (
              <Grid
                key={index + 1}
                size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              >
                <KpiCardSkeleton />
              </Grid>
            ))
            : MovementKpiData.map((kpi) => (
              <Grid
                key={kpi.title}
                size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              >
                <KpiCard {...kpi} />
              </Grid>
            ))}
        </Grid>
        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Recent  Violations */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label="Recent Incident"
              violations={recentMovementViolationsLive}
              loading={movementrecentLoading}
              onDownload={handleDownloadMovementViolation}
              tooltipMessage="Latest 20 movement detection during shutdown hours with details."
            />
          </Grid>
          {/*  Compliance by Zone */}

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label="Zone Incident"
              violationsZone={MovementZoneViolationsForUi}
              loading={movementzoneLoading}
              tooltipMessage="Shows people presence during shutdown hours incidents per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Violations Report */}
      <ReportTable
        title={t("Detailed Report")}
        tooltipMessage="Detailed incidents report with filter, reset, and CSV/PDF download options."
        data={detailedMovementReport?.data || []}
        columns={movementTableColumns}
        filters={movementTableFilters}
        onSubmit={handleMovementSubmitFilter}
        onReset={handleMovementReset}
        onExport={handleMovementExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadMovementSingle(row as MovemnetDuringShutDownHrViolation, index)
        }
        downloadingRows={downloadingRows}
        onView={(row) =>
          handleViewMovementSingle(row as MovemnetDuringShutDownHrViolation)
        }
        downloadFileName="movement-during-shutdown-hr-violations-report"
        loading={movementreportLoading}
        totalCount={detailedMovementReport?.total || 0}
        page={movementPage}
        rowsPerPage={movementLimit}
        onPageChange={(newPage) => setMovementPage(newPage)}
        onRowsPerPageChange={(rows) => {
          setMovementLimit(rows);
          setMovementPage(0);
        }}
      />
      {/* View Alert Popup */}
      <ViewAlertPopup
        open={viewMovementPopupOpen}
        handleClose={() => setViewMovementPopupOpen(false)}
        details={viewMovementPopupData}
        imageKey="imageUrl"
        onDownload={(url) => {
          if (!viewMovementPopupData) return;
          handleDownloadMovementViolation(url, viewMovementPopupData);
        }}
      />
    </Box>
  );
};

export default MovementDuringShutdownHours;
