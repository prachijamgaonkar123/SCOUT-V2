"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolationsOld";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  FallDetectionDetailedReportResponse,
  FallDetectionFilterParams,
  FallDetectionKpiItem,
  FallDetectionSocketPayload,
  FallDetectionViolation,
  FallDetectionZoneViolation,
} from "./fallDetection.types";
import {
  useGetFallDetectionDetailedCsvReportMutation,
  useGetFallDetectionDetailedPdfReportMutation,
  useGetFallDetectionSingleReportPdfMutation,
  useGetOrgShiftTimeFallLaydownDataQuery,
  useLazyGetFallLaydownDetectionDetailedReportQuery,
  useLazyGetFallLaydownDetectionKpiDataQuery,
  useLazyGetFallLaydownDetectionRecentViolationsQuery,
  useLazyGetFallLaydownDetectionZoneViolationsQuery,
} from "./fallDetectionApi";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { fallDetectionKpiConfig } from "./fallDetectionConfig";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";

const FallDetection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [fallLaydownFilters, setFallLaydownFilters] =
    useState<FallDetectionFilterParams>({});

  const [fallLaydownPage, setFallLaydownPage] = useState(0);
  const [fallLaydownLimit, setFallLaydownLimit] = useState(10);
const [isExporting, setIsExporting] = useState(false);//report loader
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());//single report loader of report table
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<FallDetectionViolation | null>(null);

  const [isFallLaydownLiveMode, setIsFallLaydownLiveMode] = useState(true);

  const [displayFallLaydownKpi, setDisplayFallLaydownKpi] = useState<
    FallDetectionKpiItem[]
  >([]);

  const [
    displayFallLaydownZoneViolations,
    setDisplayFallLaydownZoneViolations,
  ] = useState<FallDetectionZoneViolation[]>([]);

  const [fallLaydownRecentViolationsLive, setFallLaydownRecentViolationsLive] =
    useState<FallDetectionViolation[]>([]);

  const [fallLaydownDetailedReport, setFallLaydownDetailedReport] =
    useState<FallDetectionDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */

  const { data: fallLaydownOrgShifts } = useGetOrgShiftTimeFallLaydownDataQuery(
    { tenantId },
    { skip: !tenantId },
  );
  const [fetchFallLaydownKpi, { isFetching: FallLaydownKpiLoading }] =
    useLazyGetFallLaydownDetectionKpiDataQuery();
  const [
    fetchFallLaydownZoneViolations,
    { isLoading: FallLaydownZoneLoading },
  ] = useLazyGetFallLaydownDetectionZoneViolationsQuery();
  const [fetchFallLaydownRecent, { isLoading: FallLaydownRecentLoading }] =
    useLazyGetFallLaydownDetectionRecentViolationsQuery();
  const [
    fetchFallLaydownDetailedReportApi,
    { isFetching: FallLaydownDetailedReportLoading },
  ] = useLazyGetFallLaydownDetectionDetailedReportQuery();

  const [downloadFallDetectionSinglePdf] =
    useGetFallDetectionSingleReportPdfMutation();
  const [downloadFallDetectionCsvReport] =
    useGetFallDetectionDetailedCsvReportMutation();
   const [downloadFallDetectionPdfReport] =
    useGetFallDetectionDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */

  useEffect(() => {
    if (!tenantId) return;

    const loadInitial = async () => {
      const [kpi, zones, recent] = await Promise.all([
        fetchFallLaydownKpi({ tenantId }).unwrap(),
        fetchFallLaydownZoneViolations({ tenantId }).unwrap(),
        fetchFallLaydownRecent({ tenantId }).unwrap(),
      ]);

      setDisplayFallLaydownKpi(kpi ?? []);
      setDisplayFallLaydownZoneViolations(zones ?? []);
      setFallLaydownRecentViolationsLive(recent ?? []);
    };

    loadInitial().catch(console.error);
  }, [
    tenantId,
    fetchFallLaydownKpi,
    fetchFallLaydownZoneViolations,
    fetchFallLaydownRecent,
  ]);
  useEffect(() => {
    if (!tenantId) return;

    const loadDetailedReport = async () => {
      const alarmValue =
        fallLaydownFilters?.alarmTriggered === undefined
          ? undefined
          : fallLaydownFilters.alarmTriggered === "True";

      const body = {
        tenantId,
        page: fallLaydownPage + 1,
        limit: fallLaydownLimit,
        // violation: fallLaydownFilters?.violation || undefined,
        zone: fallLaydownFilters?.zone || undefined,
        cameraName: fallLaydownFilters?.cameraName || undefined,
        alarmTriggered: alarmValue,
        startDate: formatLocalDateTime(fallLaydownFilters?.startDate),
        endDate: formatLocalDateTime(fallLaydownFilters?.endDate),
      };

      const response = await fetchFallLaydownDetailedReportApi(body).unwrap();

      setFallLaydownDetailedReport(response);
    };

    loadDetailedReport().catch(console.error);
  }, [
    tenantId,
    fallLaydownPage,
    fallLaydownLimit,
    fallLaydownFilters,
    fetchFallLaydownDetailedReportApi,
  ]);

  /* ---------- SOCKET (LIVE ONLY) ---------- */
  useSocketEvent<FallDetectionSocketPayload>({
    tenantId,
    enabled: isFallLaydownLiveMode,
    event: SOCKET_EVENTS.FALL_DETECTION_UPDATE,
    handler: (payload) => {
      console.log("payload form the socket", payload);
      setDisplayFallLaydownKpi(payload.kpi ?? []);
      setDisplayFallLaydownZoneViolations(payload.zoneViolations ?? []);
      setFallLaydownRecentViolationsLive(payload.recentViolations ?? []);
    },
  });

  /* ---------- TIME FILTER ---------- */
  const handleFallLaydownRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        setIsFallLaydownLiveMode(true);

        // ✅ CALL ALL APIs + SET STATE
        const [kpi, zones, recent] = await Promise.all([
          fetchFallLaydownKpi({ tenantId }).unwrap(),
          fetchFallLaydownZoneViolations({ tenantId }).unwrap(),
          fetchFallLaydownRecent({ tenantId }).unwrap(),
        ]);

        setDisplayFallLaydownKpi(kpi ?? []);
        setDisplayFallLaydownZoneViolations(zones ?? []);
        setFallLaydownRecentViolationsLive(recent ?? []);
        return;
      }

      setIsFallLaydownLiveMode(false);
      const payload = {
        tenantId: tenantId,
        startDate: range.start,
        endDate: range.end,
      };
      const [kpi, zones, recent] = await Promise.all([
        fetchFallLaydownKpi(payload).unwrap(),
        fetchFallLaydownZoneViolations(payload).unwrap(),
        fetchFallLaydownRecent(payload).unwrap(),
      ]);

      setDisplayFallLaydownKpi(kpi ?? []);
      setDisplayFallLaydownZoneViolations(zones ?? []);
      setFallLaydownRecentViolationsLive(recent ?? []);
    },
    [
      tenantId,
      fetchFallLaydownKpi,
      fetchFallLaydownZoneViolations,
      fetchFallLaydownRecent,
    ],
  );
  const fallLaydownKpiData = useMemo(
    () =>
      displayFallLaydownKpi.map((item) => {
        const config = fallDetectionKpiConfig[item.title];

        return {
          ...item,
          title: t(item.title),
          icon: config?.icon || EngineeringIcon,
          tooltipMessage: config?.tooltipMessage || "",
        };
      }),
    [displayFallLaydownKpi, t],
  );

  const fallLaydownZoneViolationsForUi = useMemo(() => {
    return displayFallLaydownZoneViolations.map((z) => ({
      zone: z.zone,
      incident: z.incidents,
    }));
  }, [displayFallLaydownZoneViolations]);

  /* ---------- REPORT HANDLERS ---------- */

  const tableColumns = [
    { id: "incident", label: t("Incident") },
    { id: "time", label: t("Time") },
    { id: "zone", label: t("Zone") },
    { id: "camera", label: t("Cameras") },
    { id: "alarmTriggered", label: t("Alarm Triggered") },
  ];

  const tableFilters = [
    {
      id: "zone",
      label: t("Zone"),
      type: "select" as const,

      options: fallLaydownDetailedReport?.zones || [],
    },
    {
      id: "camera",
      label: t("Cameras"),
      type: "select" as const,

      options: fallLaydownDetailedReport?.cameras || [],
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

  const handleFallLaydownSubmitFilter = useCallback(
    (filters: FallDetectionFilterParams) => {
      console.log("filter params", filters);
      setFallLaydownPage(0); // ← set page FIRST
      setFallLaydownFilters(filters); // ← then filters
    },
    [], // no deps needed
  );
  const handleFallLaydownReset = useCallback(() => {
    setFallLaydownFilters({});
    setFallLaydownPage(0);
  }, []);

  const handleExport = useCallback(
    async (format: "csv" | "pdf", filters: FallDetectionFilterParams) => {
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
          await downloadFallDetectionCsvReport(payload);
        }

        // ================= PDF =================
        if (format === "pdf") {
          await downloadFallDetectionPdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      }finally{
        setIsExporting(false);
      }
    },
    [
      tenantId,
      downloadFallDetectionCsvReport,
      downloadFallDetectionPdfReport,
      formatLocalDateTime,
    ],
  );

  const handleDownloadSingle = useCallback(
    async (row: FallDetectionViolation,index:number) => {
      try {
 setDownloadingRows((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });        const payload = {
          tenantId,
          incident: String(row.incident),
          zone: row.zone,
          time: row.time,
          camera: row.camera,
          imageUrl: row.imageUrl,                
          alarmTriggered: row.alarmTriggered,


        };

        await downloadFallDetectionSinglePdf(payload);
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
    [tenantId, downloadFallDetectionSinglePdf],
  );

  const handleFallLaydownViewSingle = useCallback(
    (row: FallDetectionViolation) => {
      setViewPopupData(row);
      setViewPopupOpen(true);
    },
    [],
  );

  //recent violation download
  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const fallRecentViolation = violation as FallDetectionViolation;
    try {
      const payload = {
        tenantId: tenantId,
        incident: String(fallRecentViolation.incident),
        zone: fallRecentViolation.zone,
        time: fallRecentViolation.time,
        camera: fallRecentViolation.camera,
        imageUrl: url,
                alarmTriggered: fallRecentViolation.alarmTriggered,

      };

      await downloadFallDetectionSinglePdf(payload);
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
            onRangeChange={handleFallLaydownRangeChange}
            shifts={fallLaydownOrgShifts || []}
          />
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {FallLaydownKpiLoading || !fallLaydownKpiData.length
            ? Array.from({ length: 6 }).map((_, index) => (
                <Grid
                  key={index + 1}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                >
                  <KpiCardSkeleton />
                </Grid>
              ))
            : fallLaydownKpiData.map((kpi) => (
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
              label={t("Recent Incidents")}
              violations={fallLaydownRecentViolationsLive}
              loading={FallLaydownRecentLoading}
              tooltipMessage="Latest 20 detected fall incidents with details."
                onDownload={handleDownloadViolation}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label={t("Zone Incidents")}
              violationsZone={fallLaydownZoneViolationsForUi}
              loading={FallLaydownZoneLoading}
              tooltipMessage="Shows fall incidents per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      <ReportTable
        title={t("Detailed Report")}
        tooltipMessage="Detailed fall or laydown incidents report with filter, reset, and CSV/PDF download options."
        data={fallLaydownDetailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleFallLaydownSubmitFilter}
        onReset={handleFallLaydownReset}
        onExport={handleExport}
         exportLoading={isExporting}
        onDownload={(row,index) =>
          handleDownloadSingle(row as FallDetectionViolation,index)
        }
        downloadingRows={downloadingRows}
        onView={(row) =>
          handleFallLaydownViewSingle(row as FallDetectionViolation)
        }
        downloadFileName="fall-laydown-detection-report"
        loading={FallLaydownDetailedReportLoading}
        totalCount={fallLaydownDetailedReport?.total || 0}
        page={fallLaydownPage}
        rowsPerPage={fallLaydownLimit}
        onPageChange={(newPage) => setFallLaydownPage(newPage)}
        onRowsPerPageChange={(rows) => {
          setFallLaydownLimit(rows);
          setFallLaydownPage(0);
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

export default FallDetection;
