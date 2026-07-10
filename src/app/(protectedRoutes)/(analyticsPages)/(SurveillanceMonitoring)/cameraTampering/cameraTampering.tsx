"use client";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  Warning,
  VisibilityOff,
  VideocamOff,
  SvgIconComponent,
} from "@mui/icons-material";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import { useCallback, useEffect, useMemo, useState } from "react";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  CameraTamperingDetailedReportResponse,
  CameraTamperingFilterParams,
  CameraTamperingKpiItem,
  CameraTamperingSocketPayload,
  CameraTamperingViolation,
  CameraTamperingZoneViolation,
} from "./cameraTampering.types";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import {
  useGetCameraTamperingDetailedCsvReportMutation,
  useGetCameraTamperingDetailedPdfReportMutation,
  useGetCameraTamperingSingleReportPdfMutation,
  useGetOrgShiftTimeCameraTamperingDataQuery,
  useLazyGetCameraTamperingDetailedReportQuery,
  useLazyGetCameraTamperingDataQuery,
} from "./cameraTamperingApi";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { cameraTamperingKpiConfig } from "./cameraTamperingConfig";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";

const CameraTampering: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [cameraTamperingFilters, setCameraTamperingFilters] =
    useState<CameraTamperingFilterParams>({});

  const [cameraTamperingPage, setCameraTamperingPage] = useState(0);
  const [cameraTamperingLimit, setCameraTamperingLimit] = useState(10);

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<CameraTamperingViolation | null>(null);

  const [isCameraTamperingLiveMode, setIsCameraTamperingLiveMode] =
    useState(true);

  const [displayCameraTamperingKpi, setDisplayCameraTamperingKpi] = useState<
    CameraTamperingKpiItem[]
  >([]);

  const [isExporting, setIsExporting] = useState(false);
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(
    new Set(),
  );

  const [
    displayCameraTamperingZoneViolations,
    setDisplayCameraTamperingZoneViolations,
  ] = useState<CameraTamperingZoneViolation[]>([]);

  const [
    cameraTamperingRecentViolationsLive,
    setCameraTamperingRecentViolationsLive,
  ] = useState<CameraTamperingViolation[]>([]);

  const [cameraTamperingDetailedReport, setCameraTamperingDetailedReport] =
    useState<CameraTamperingDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */
  const { data: cameraTamperingOrgShifts } =
    useGetOrgShiftTimeCameraTamperingDataQuery(
      { tenantId },
      { skip: !tenantId },
    );

  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetCameraTamperingDataQuery();

  const [
    fetchCameraTamperingDetailedReportApi,
    { isFetching: cameraTamperingDetailedReportLoading },
  ] = useLazyGetCameraTamperingDetailedReportQuery();

  const [downloadCameraTamperingSinglePdf] =
    useGetCameraTamperingSingleReportPdfMutation();
  const [downloadCameraTamperingCsvReport] =
    useGetCameraTamperingDetailedCsvReportMutation();
  const [downloadCameraTamperingPdfReport] =
    useGetCameraTamperingDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (!tenantId) return;
    const loadInitial = async () => {
      const data = await fetchOverviewData({ tenantId }).unwrap();
      setDisplayCameraTamperingKpi(data?.kpi ?? []);
      setDisplayCameraTamperingZoneViolations(data?.zoneViolations ?? []);
      setCameraTamperingRecentViolationsLive(data?.recentViolations ?? []);
    };
    loadInitial().catch(console.error);
  }, [tenantId, fetchOverviewData]);

  useEffect(() => {
    if (!tenantId) return;

    const loadDetailedReport = async () => {
      const alarmValue =
        cameraTamperingFilters?.alarmTriggered === undefined
          ? undefined
          : cameraTamperingFilters.alarmTriggered === "True";

      const body = {
        tenantId,
        page: cameraTamperingPage + 1,
        limit: cameraTamperingLimit,
        violation: cameraTamperingFilters?.violation || undefined,
        zone: cameraTamperingFilters?.zone || undefined,
        camera: cameraTamperingFilters?.camera || undefined,
        alarmTriggered: alarmValue,
        startDate: formatLocalDateTime(cameraTamperingFilters?.startDate),
        endDate: formatLocalDateTime(cameraTamperingFilters?.endDate),
      };

      const response =
        await fetchCameraTamperingDetailedReportApi(body).unwrap();

      setCameraTamperingDetailedReport(response);
    };

    loadDetailedReport().catch(console.error);
  }, [
    tenantId,
    cameraTamperingPage,
    cameraTamperingLimit,
    cameraTamperingFilters,
    fetchCameraTamperingDetailedReportApi,
  ]);

  /* ---------- SOCKET (LIVE ONLY) ---------- */
  useSocketEvent<CameraTamperingSocketPayload>({
    tenantId,
    enabled: isCameraTamperingLiveMode,
    event: SOCKET_EVENTS.CAMERA_TAMPERING_UPDATE,
    handler: (payload) => {
      setDisplayCameraTamperingKpi(payload.kpi ?? []);
      setDisplayCameraTamperingZoneViolations(payload.zoneViolations ?? []);
      setCameraTamperingRecentViolationsLive(payload.recentViolations ?? []);
    },
  });

  /* ---------- TIME FILTER ---------- */
  const handleCameraTamperingRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        setIsCameraTamperingLiveMode(true);
        const data = await fetchOverviewData({ tenantId }).unwrap();
        setDisplayCameraTamperingKpi(data?.kpi ?? []);
        setDisplayCameraTamperingZoneViolations(data?.zoneViolations ?? []);
        setCameraTamperingRecentViolationsLive(data?.recentViolations ?? []);
        return;
      }

      setIsCameraTamperingLiveMode(false);
      const data = await fetchOverviewData({
        tenantId,
        startDate: range.start,
        endDate: range.end,
      }).unwrap();
      setDisplayCameraTamperingKpi(data?.kpi ?? []);
      setDisplayCameraTamperingZoneViolations(data?.zoneViolations ?? []);
      setCameraTamperingRecentViolationsLive(data?.recentViolations ?? []);
    },
    [tenantId, fetchOverviewData],
  );

  /* ---------- DERIVED DATA ---------- */


const cameraTamperingKpiData = useMemo(() => {
  return displayCameraTamperingKpi.map((item) => {
    const config = cameraTamperingKpiConfig[
      item.title as keyof typeof cameraTamperingKpiConfig
    ];

    const displayValue = Array.isArray(item.value)
      ? item.value.length === 0
        ? "-"
        : item.value.join(", ")
      : item.value;

    return {
      title: item.title,
      value: displayValue,
      color: item.color,
      icon: config?.icon || EngineeringIcon,
      tooltipMessage: config?.tooltipMessage,
    };
  });
}, [displayCameraTamperingKpi]);
  const zoneViolationsForUi = useMemo(() => {
    const iconMap: Record<string, SvgIconComponent> = {
      "Lens Covered": VisibilityOff,
      "Lens Obstructed": VisibilityOff,
      "Blur Vision": VisibilityOff,
      Offline: VideocamOff,
      Disconnected: Warning,
    };

    return displayCameraTamperingZoneViolations.map((z) => ({
      ...z,
      subViolations: z.subViolations?.map((s) => ({
        ...s,
        icon: iconMap[s.label] || Warning,
      })),
    }));
  }, [displayCameraTamperingZoneViolations]);

  /* ---------- REPORT HANDLERS ---------- */
  const tableColumns = [
    { id: "violation", label: t("Violation") },
    { id: "time", label: t("Time") },
    { id: "zone", label: t("Zone") },
    { id: "camera", label: t("Camera") },
    { id: "alarmTriggered", label: t("Alarm Triggered") },
  ];

  const tableFilters = [
    {
      id: "violation",
      label: t("Violation"),
      type: "select" as const,
      options: [
        "Lens Covered",
        "Blur Vision",
        "Disconnected",
        "Offline",
        "Lens Obstructed",
      ],
    },
    {
      id: "zone",
      label: t("Zone"),
      type: "select" as const,
      options: cameraTamperingDetailedReport?.zones || [],
    },
    {
      id: "camera",
      label: t("Camera"),
      type: "select" as const,
      options: cameraTamperingDetailedReport?.cameras || [],
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

  const handleSubmitFilter = useCallback(
    (filters: CameraTamperingFilterParams) => {
      setCameraTamperingPage(0);
      setCameraTamperingFilters(filters);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setCameraTamperingFilters({});
    setCameraTamperingPage(0);
  }, []);

  const handleExport = useCallback(
    async (format: "csv" | "pdf", filters: CameraTamperingFilterParams) => {
      try {
        setIsExporting(true);
        const payload = {
          tenantId,
          violation: filters.violation || undefined,
          zone: filters.zone || undefined,
          camera: filters.camera || undefined,
          startDate: formatLocalDateTime(filters.startDate),
          endDate: formatLocalDateTime(filters.endDate),
        };

        if (format === "csv") {
          await downloadCameraTamperingCsvReport(payload);
        }

        if (format === "pdf") {
          await downloadCameraTamperingPdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      } finally {
        setIsExporting(false);
      }
    },
    [
      tenantId,
      downloadCameraTamperingCsvReport,
      downloadCameraTamperingPdfReport,
    ],
  );

  const handleDownloadSingle = useCallback(
    async (row: CameraTamperingViolation, index: number) => {
      try {
        setDownloadingRows((prev) => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        });

        const payload = {
          tenantId,
          violation: row.violation,
          zone: row.zone,
          time: row.time,
          camera: row.camera,
          imageUrl: row.imageUrl,
          alarmTriggered: row.alarmTriggered,
        };

        await downloadCameraTamperingSinglePdf(payload);
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
    [tenantId, downloadCameraTamperingSinglePdf],
  );

  const handleViewSingle = useCallback((row: CameraTamperingViolation) => {
    setViewPopupData(row);
    setViewPopupOpen(true);
  }, []);

  const handleDownloadViolation = async (
    url: string,
    violation: Violation,
  ) => {
    if (!violation) return;
    const cameraTamperingIncident = violation as CameraTamperingViolation;
    try {
      const payload = {
        tenantId,
        violation: cameraTamperingIncident.violation,
        zone: cameraTamperingIncident.zone,
        time: cameraTamperingIncident.time,
        cameraId: cameraTamperingIncident.cameraId,
        imageUrl: url,
        alarmTriggered: cameraTamperingIncident.alarmTriggered,
      };

      await downloadCameraTamperingSinglePdf(payload);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, backgroundColor: "#fff", borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">📊 {t("Overview")}</Typography>
          <TimeFilter
            onRangeChange={handleCameraTamperingRangeChange}
            shifts={cameraTamperingOrgShifts || []}
          />
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {overviewLoading || !cameraTamperingKpiData.length
            ? Array.from({ length: 4 }).map((_, index) => (
                <Grid
                  key={index + 1}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                >
                  <KpiCardSkeleton />
                </Grid>
              ))
            : cameraTamperingKpiData.map((kpi) => (
                <Grid
                  key={kpi.title}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                >
                  <KpiCard {...kpi} />
                </Grid>
              ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label={t("Recent Violations")}
              violations={cameraTamperingRecentViolationsLive}
              loading={overviewLoading}
              tooltipMessage="Latest detected camera tampering/offline events with details."
              onDownload={handleDownloadViolation}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label={t("Zone Violations")}
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows offline/tampered camera incidents per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      <ReportTable
        title={t("Detailed Report")}
        tooltipMessage="Detailed camera tampering/offline detection report with filter, reset, and CSV/PDF download options."
        data={cameraTamperingDetailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(row as CameraTamperingViolation, index)
        }
        downloadingRows={downloadingRows}
        onView={(row) => handleViewSingle(row as CameraTamperingViolation)}
        downloadFileName="camera-tampering-report"
        loading={cameraTamperingDetailedReportLoading}
        totalCount={cameraTamperingDetailedReport?.total || 0}
        page={cameraTamperingPage}
        rowsPerPage={cameraTamperingLimit}
        onPageChange={(newPage) => setCameraTamperingPage(newPage)}
        onRowsPerPageChange={(rows) => {
          setCameraTamperingLimit(rows);
          setCameraTamperingPage(0);
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

export default CameraTampering;
