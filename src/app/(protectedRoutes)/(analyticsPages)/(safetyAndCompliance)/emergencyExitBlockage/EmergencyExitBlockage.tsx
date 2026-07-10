"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSelector } from "react-redux";

import { RootState } from "@/app/store/store";

import {
  Box,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import {
  Block,
  CheckCircle,
  LocationOn,
} from "@mui/icons-material";

import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";

import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";

import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";

import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolationsOld";

import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";

import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";

import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";

import {
  useGetOrgShiftTimeDataQuery,
  useLazyGetEmergencyExitBlockageDetectionDataQuery,
  useLazyGetEmergencyExitBlockageDetectionDetailedReportQuery,
  useGetEmergencyExitBlockageDetectionSingleReportPdfMutation,
  useGetEmergencyExitBlockageDetectionDetailedCsvReportMutation,
  useGetEmergencyExitBlockageDetectionDetailedPdfReportMutation,
} from "./EmergencyExitBlockageApi";

import {
  EmergencyExitBlockageDetailedReportResponse,
  EmergencyExitBlockageFilterParams,
  EmergencyExitBlockageRecentViolation,
  EmergencyExitBlockageResponse,
  EmergencyExitBlockageKpiItem,
  EmergencyExitBlockageZoneViolation,
} from "./EmergencyExitBlockage.types";

import { formatLocalDateTime } from "@/utils/formatLocalDateTime";

import { useSocketEvent } from "@/customhooks/useSocketEvent";

import { SOCKET_EVENTS } from "@/sockets/socket.events";

const EmergencyExitBlockage: React.FC = () => {
  const { user } = useSelector(
    (state: RootState) => state.auth,
  );

  const tenantId = user?.org_id ?? "";

  /* ---------------------------------- */
  /* STATE */
  /* ---------------------------------- */

  const [filters, setFilters] =
    useState<EmergencyExitBlockageFilterParams>(
      {},
    );

  const [page, setPage] = useState(0);

  const [limit, setLimit] = useState(10);

  const [isExporting, setIsExporting] =
    useState(false);

  const [downloadingRows, setDownloadingRows] =
    useState<Set<number>>(new Set());

  const [viewPopupOpen, setViewPopupOpen] =
    useState(false);

  const [viewPopupData, setViewPopupData] =
    useState<EmergencyExitBlockageRecentViolation | null>(
      null,
    );

  const [isLiveMode, setIsLiveMode] =
    useState(true);

  const [displayKpi, setDisplayKpi] =
    useState<EmergencyExitBlockageKpiItem[]>(
      [],
    );

  const [
    displayZoneViolations,
    setDisplayZoneViolations,
  ] = useState<
    EmergencyExitBlockageZoneViolation[]
  >([]);

  const [
    recentViolationsLive,
    setRecentViolationsLive,
  ] = useState<
    EmergencyExitBlockageRecentViolation[]
  >([]);

  const [detailedReport, setDetailedReport] =
    useState<EmergencyExitBlockageDetailedReportResponse | null>(
      null,
    );

  /* ---------------------------------- */
  /* API */
  /* ---------------------------------- */

  const { data: orgShifts } =
    useGetOrgShiftTimeDataQuery(
      { tenantId },
      { skip: !tenantId },
    );

  const [
    fetchOverviewData,
    { isFetching: overviewLoading },
  ] =
    useLazyGetEmergencyExitBlockageDetectionDataQuery();

  const [
    fetchDetailedReport,
    { isFetching: detailedLoading },
  ] =
    useLazyGetEmergencyExitBlockageDetectionDetailedReportQuery();

  const [downloadSinglePdf] =
    useGetEmergencyExitBlockageDetectionSingleReportPdfMutation();

  const [downloadCsvReport] =
    useGetEmergencyExitBlockageDetectionDetailedCsvReportMutation();

  const [downloadPdfReport] =
    useGetEmergencyExitBlockageDetectionDetailedPdfReportMutation();

  /* ---------------------------------- */
  /* INITIAL LOAD */
  /* ---------------------------------- */

  useEffect(() => {
    if (!tenantId) return;

    const loadInitial = async () => {
      const response =
        await fetchOverviewData({
          tenantId,
        }).unwrap();

      setDisplayKpi(
        response?.kpi || [],
      );

      setDisplayZoneViolations(
        response?.zoneViolations || [],
      );

      setRecentViolationsLive(
        response?.recentViolations || [],
      );
    };

    loadInitial().catch(console.error);
  }, [tenantId, fetchOverviewData]);

  /* ---------------------------------- */
  /* DETAILED REPORT */
  /* ---------------------------------- */

  useEffect(() => {
    if (!tenantId) return;

    const loadDetailed = async () => {
      const response =
        await fetchDetailedReport({
          tenantId,

          page: page + 1,

          limit,

          emergencyExitRoute:
            filters?.emergencyExitRoute ||
            undefined,

          zone:
            filters?.zone || undefined,

          camera:
            filters?.camera || undefined,

          alarmTriggered:
            filters?.alarmTriggered ===
            undefined
              ? undefined
              : filters.alarmTriggered ===
                "True",

          startDate: formatLocalDateTime(
            filters?.startDate,
          ),

          endDate: formatLocalDateTime(
            filters?.endDate,
          ),
        }).unwrap();

      setDetailedReport(response);
    };

    loadDetailed().catch(console.error);
  }, [
    tenantId,
    page,
    limit,
    filters,
    fetchDetailedReport,
  ]);

  /* ---------------------------------- */
  /* SOCKET */
  /* ---------------------------------- */

  useSocketEvent({
    tenantId,

    enabled: isLiveMode,

    event:
      SOCKET_EVENTS.EMERGENCY_EXIT_BLOCKAGE_UPDATE,

    handler: (payload: EmergencyExitBlockageResponse) => {
      setDisplayKpi(
        payload?.kpi || [],
      );

      setDisplayZoneViolations(
        payload?.zoneViolations || [],
      );

      setRecentViolationsLive(
        payload?.recentViolations || [],
      );
    },
  });

  /* ---------------------------------- */
  /* TIME FILTER */
  /* ---------------------------------- */

  const handleRangeChange =
    useCallback(
      async (range: {
        start?: string;
        end?: string;
      }) => {
        if (!range.start && !range.end) {
          setIsLiveMode(true);

          const response =
            await fetchOverviewData({
              tenantId,
            }).unwrap();

          setDisplayKpi(
            response?.kpi || [],
          );

          setDisplayZoneViolations(
            response?.zoneViolations || [],
          );

          setRecentViolationsLive(
            response?.recentViolations || [],
          );

          return;
        }

        setIsLiveMode(false);

        const response =
          await fetchOverviewData({
            tenantId,

            startDate: range.start,

            endDate: range.end,
          }).unwrap();

        setDisplayKpi(
          response?.kpi || [],
        );

        setDisplayZoneViolations(
          response?.zoneViolations || [],
        );

        setRecentViolationsLive(
          response?.recentViolations || [],
        );
      },
      [tenantId, fetchOverviewData],
    );

  /* ---------------------------------- */
  /* KPI DATA */
  /* ---------------------------------- */

  const kpiData = useMemo(() => {
    return displayKpi.map(
      (item) => ({
        title: item.title,

        value: item.value,

        tooltipMessage:
          item.title ===
          "Blocked Emergency Exit"
            ? "Shows total blocked emergency exits detected."
            : item.title ===
                "Clear Emergency Exit Routes"
              ? "Shows total clear emergency exit routes."
              : "Shows affected zones.",

        icon:
          item.title ===
          "Blocked Emergency Exit"
            ? Block
            : item.title ===
                "Clear Emergency Exit Routes"
              ? CheckCircle
              : LocationOn,

        colour: item.color,
      }),
    );
  }, [displayKpi]);

    const zoneViolationsForUi = useMemo(() => {
    return displayZoneViolations.map((z) => ({
      zone: z.zone,
      BlockedExit: z.violations,
    }));
  }, [displayZoneViolations]);

  /* ---------------------------------- */
  /* TABLE CONFIG */
  /* ---------------------------------- */

  const tableColumns = [
    {
      id: "violation",
      label: "Violation",
      minWidth: 180,
    },

    {
      id: "emergencyExitRoute",
      label:
        "Emergency Exit Route",
      minWidth: 180,
    },

    {
      id: "time",
      label: "Time",
      minWidth: 150,
    },

    {
      id: "zone",
      label: "Zone",
      minWidth: 120,
    },

    {
      id: "camera",
      label: "Camera",
      minWidth: 120,
    },

    {
      id: "alarmTriggered",
      label:
        "Alarm Triggered",
      minWidth: 150,
    },
  ];

  const tableFilters = [
    {
      id: "emergencyExitRoute",
      label:
        "Emergency Exit Route",
      type: "select" as const,
      options:
        detailedReport
          ?.emergencyExitRoutes || [],
    },

    {
      id: "zone",
      label: "Zone",
      type: "select" as const,
      options:
        detailedReport?.zones || [],
    },

    {
      id: "camera",
      label: "Camera",
      type: "select" as const,
      options:
        detailedReport?.cameras || [],
    },

    {
      id: "alarmTriggered",
      label:
        "Alarm Triggered",
      type: "select" as const,
      options: [
        "True",
        "False",
      ],
    },

    {
      id: "startDate",
      label: "Start Date",
      type: "date" as const,
    },

    {
      id: "endDate",
      label: "End Date",
      type: "date" as const,
    },
  ];

  /* ---------------------------------- */
  /* HANDLERS */
  /* ---------------------------------- */

  const handleSubmitFilter =
    useCallback(
      (
        newFilters: EmergencyExitBlockageFilterParams,
      ) => {
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
      exportFilters: EmergencyExitBlockageFilterParams,
    ) => {
      try {
        setIsExporting(true);

        const payload = {
          tenantId,

          emergencyExitRoute:
            exportFilters.emergencyExitRoute ||
            undefined,

          zone:
            exportFilters.zone ||
            undefined,

          camera:
            exportFilters.camera ||
            undefined,

          startDate:
            formatLocalDateTime(
              exportFilters.startDate,
            ),

          endDate:
            formatLocalDateTime(
              exportFilters.endDate,
            ),
        };

        if (format === "csv") {
          await downloadCsvReport(
            payload,
          );
        }

        if (format === "pdf") {
          await downloadPdfReport(
            payload,
          ).unwrap();
        }
      } catch (error) {
        console.error(
          "Export failed",
          error,
        );
      } finally {
        setIsExporting(false);
      }
    },
    [
      tenantId,
      downloadCsvReport,
      downloadPdfReport,
    ],
  );

  const handleDownloadSingle =
    useCallback(
      async (
        row: EmergencyExitBlockageRecentViolation,
        index: number,
      ) => {
        try {
          setDownloadingRows(
            (prev) =>
              new Set(prev).add(index),
          );

          await downloadSinglePdf({
            tenantId,

            violation:
              row.violation,

            emergencyExitRoute:
              row.emergencyExitRoute,

            zone: row.zone,

            camera: row.camera,

            imageUrl:
              row.imageUrl,

            time: row.time,

            alarmTriggered:
              row.alarmTriggered,
          }).unwrap();
        } catch (error) {
          console.error(
            "Single PDF download failed",
            error,
          );
        } finally {
          setDownloadingRows(
            (prev) => {
              const next =
                new Set(prev);

              next.delete(index);

              return next;
            },
          );
        }
      },
      [tenantId, downloadSinglePdf],
    );

  const handleViewSingle =
    useCallback(
      (
        row: EmergencyExitBlockageRecentViolation,
      ) => {
        setViewPopupData(row);

        setViewPopupOpen(true);
      },
      [],
    );

  /* ---------------------------------- */
  /* RENDER */
  /* ---------------------------------- */

  return (
    <Box>
      <Paper
        sx={{
          p: 2.5,
          mb: 4,
          backgroundColor:
            "#ffffff",
          borderRadius: 2,
        }}
      >
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            📊 Overview
          </Typography>

          <TimeFilter
            onRangeChange={
              handleRangeChange
            }
            shifts={
              orgShifts || []
            }
          />
        </Box>

        {/* KPI */}

        <Grid
          container
          spacing={2.5}
          sx={{ mb: 4 }}
        >
          {overviewLoading ||
          !kpiData.length
            ? Array.from({
                length: 3,
              }).map((_, i) => (
                <Grid
                  key={`skeleton-${i}`}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                    xl: 2,
                  }}
                >
                  <KpiCardSkeleton />
                </Grid>
              ))
            : kpiData.map((kpi) => (
                <Grid
                  key={kpi.title}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                    xl: 2,
                  }}
                >
                  <KpiCard
                    {...kpi}
                  />
                </Grid>
              ))}
        </Grid>

        {/* Recent + Zone */}

        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <RecentViolations
              label="Recent Violations"
              tooltipMessage="Latest emergency exit blockage detections."
              violations={
                recentViolationsLive
              }
              loading={
                overviewLoading
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <ZoneViolations
              violationsZone={
                zoneViolationsForUi
              }
              loading={
                overviewLoading
              }
              tooltipMessage="Emergency exit blockage violations per zone."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report */}

      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed emergency exit blockage report."
        data={
          detailedReport?.data ||
          []
        }
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={
          handleSubmitFilter
        }
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={
          isExporting
        }
        onDownload={(
          row,
          index,
        ) =>
          handleDownloadSingle(
            row as EmergencyExitBlockageRecentViolation,
            index,
          )
        }
        downloadingRows={
          downloadingRows
        }
        onView={(row) =>
          handleViewSingle(
            row as EmergencyExitBlockageRecentViolation,
          )
        }
        downloadFileName="emergency-exit-blockage-report"
        loading={
          detailedLoading
        }
        totalCount={
          detailedReport?.total ||
          0
        }
        page={page}
        rowsPerPage={limit}
        onPageChange={(
          newPage,
        ) => setPage(newPage)}
        onRowsPerPageChange={(
          rows,
        ) => {
          setLimit(rows);

          setPage(0);
        }}
      />

      {/* Popup */}

      <ViewAlertPopup
        open={viewPopupOpen}
        handleClose={() =>
          setViewPopupOpen(false)
        }
        details={
          viewPopupData
        }
        imageKey="imageUrl"
        onDownload={() => {
          if (
            !viewPopupData
          )
            return;

          handleDownloadSingle(
            viewPopupData,
            0,
          );
        }}
      />
    </Box>
  );
};

export default EmergencyExitBlockage;