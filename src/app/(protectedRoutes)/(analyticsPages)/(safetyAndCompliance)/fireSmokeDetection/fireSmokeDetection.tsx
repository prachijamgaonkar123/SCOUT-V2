"use client";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  LocalFireDepartment,
  SmokeFree,
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
  FireSmokeDetectionDetailedReportResponse,
  FireSmokeDetectionFilterParams,
  FireSmokeDetectionKpiItem,
  FireSmokeDetectionSocketPayload,
  FireSmokeDetectionViolation,
  FireSmokeDetectionZoneViolation,

} from "./fireSmokeDetection.types";

import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import {
  useGetFireSmokeDetectionDetailedCsvReportMutation,
  useGetFireSmokeDetectionDetailedPdfReportMutation,
  useGetFireSmokeDetectionSingleReportPdfMutation,
  useGetOrgShiftTimeFireSmokeDataQuery,
  useLazyGetFireSmokeDetectionDetailedReportQuery,
useLazyGetFireSmokeDetectionDataQuery
} from "./fireSmokeDetectionApi";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { fireSmokeDetectionKpiConfig } from "./fireSmokeDetectionConfig";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
const FireSmokeDetection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";
  /* ---------- STATE ---------- */
  const [fireSmokeFilters, setFireSmokeFilters] =
    useState<FireSmokeDetectionFilterParams>({});

  const [fireSmokePage, setFireSmokePage] = useState(0);
  const [fireSmokeLimit, setFireSmokeLimit] = useState(10);

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<FireSmokeDetectionViolation | null>(null);

  const [isFireSmokeLiveMode, setIsFireSmokeLiveMode] = useState(true);

  const [displayFireSmokeKpi, setDisplayFireSmokeKpi] = useState<
    FireSmokeDetectionKpiItem[]
  >([]);
  const [isExporting, setIsExporting] = useState(false);//report loader
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());//single report loader of report table

  const [displayFireSmokeZoneViolations, setDisplayFireSmokeZoneViolations] =
    useState<FireSmokeDetectionZoneViolation[]>([]);
  const [fireSmokeRecentViolationsLive, setFireSmokeRecentViolationsLive] =
    useState<FireSmokeDetectionViolation[]>([]);

  const [fireSmokeDetailedReport, setFireSmokeDetailedReport] =
    useState<FireSmokeDetectionDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */

  const { data: fireSmokeOrgShifts } = useGetOrgShiftTimeFireSmokeDataQuery(
    { tenantId },
    { skip: !tenantId },
  );
  // const [fetchFireSmokeKpi, { isFetching: FireSmokeKpiLoading }] =
  //   useLazyGetFireSmokeDetectionKpiDataQuery();
  // const [fetchFireSmokeZoneViolations, { isLoading: FireSmokeZoneLoading }] =
  //   useLazyGetFireSmokeDetectionZoneViolationsQuery();
  // const [fetchFireSmokeRecent, { isLoading: FireSmokeRecentLoading }] =
  //   useLazyGetFireSmokeDetectionRecentViolationsQuery();

 // One call → gets kpi + zoneViolations + recentViolations together
  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetFireSmokeDetectionDataQuery();


  const [
    fetchFireSmokeDetailedReportApi,
    { isFetching: FireSmokeDetailedReportLoading },
  ] = useLazyGetFireSmokeDetectionDetailedReportQuery();

  const [downloadFireSmokeDetectionSinglePdf] =
    useGetFireSmokeDetectionSingleReportPdfMutation();
  const [downloadFireSmokeDetectionCsvReport] =
    useGetFireSmokeDetectionDetailedCsvReportMutation();
  const [downloadFireSmokeDetectionPdfReport] =
    useGetFireSmokeDetectionDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */

 
    useEffect(() => {
      if (!tenantId) return;
      const loadInitial = async () => {
        const data = await fetchOverviewData({ tenantId }).unwrap();
        setDisplayFireSmokeKpi(data?.kpi ?? []);
        setDisplayFireSmokeZoneViolations(data?.zoneViolations ?? []);
        setFireSmokeRecentViolationsLive(data?.recentViolations ?? []);
      };
      loadInitial().catch(console.error);
    }, [tenantId, fetchOverviewData]);
  useEffect(() => {
    if (!tenantId) return;

    const loadDetailedReport = async () => {
      const alarmValue =
        fireSmokeFilters?.alarmTriggered === undefined
          ? undefined
          : fireSmokeFilters.alarmTriggered === "True";

      const body = {
        tenantId,
        page: fireSmokePage + 1,
        limit: fireSmokeLimit,
        incident: fireSmokeFilters?.incident || undefined,
        zone: fireSmokeFilters?.zone || undefined,
        cameraName: fireSmokeFilters?.camera || undefined,
        alarmTriggered: alarmValue,
        startDate: formatLocalDateTime(fireSmokeFilters?.startDate),
        endDate: formatLocalDateTime(fireSmokeFilters?.endDate),
      };

      const response = await fetchFireSmokeDetailedReportApi(body).unwrap();

      setFireSmokeDetailedReport(response);
    };

    loadDetailedReport().catch(console.error);
  }, [
    tenantId,
    fireSmokePage,
    fireSmokeLimit,
    fireSmokeFilters,
    fetchFireSmokeDetailedReportApi,
  ]);

  /* ---------- SOCKET (LIVE ONLY) ---------- */
  useSocketEvent<FireSmokeDetectionSocketPayload>({
    tenantId,
    enabled: isFireSmokeLiveMode,
    event: SOCKET_EVENTS.FIRE_SMOKE_UPDATE,
    handler: (payload) => {
      console.log("payload form the socket", payload);
      setDisplayFireSmokeKpi(payload.kpi ?? []);
      setDisplayFireSmokeZoneViolations(payload.zoneViolations ?? []);
      setFireSmokeRecentViolationsLive(payload.recentViolations ?? []);
    },
  });

  /* ---------- TIME FILTER ---------- */
  
const handleFireSmokeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        // Range cleared → resume live mode
        setIsFireSmokeLiveMode(true);
        const data = await fetchOverviewData({ tenantId }).unwrap();
        setDisplayFireSmokeKpi(data?.kpi ?? []);
        setDisplayFireSmokeZoneViolations(data?.zoneViolations ?? []);
        setFireSmokeRecentViolationsLive(data?.recentViolations ?? []);
        return;
      }

      // Range selected → freeze socket, fetch historical data
      setIsFireSmokeLiveMode(false);
      const data = await fetchOverviewData({
        tenantId,
        startDate: range.start,
        endDate: range.end,
      }).unwrap();
      setDisplayFireSmokeKpi(data?.kpi ?? []);
      setDisplayFireSmokeZoneViolations(data?.zoneViolations ?? []);
      setFireSmokeRecentViolationsLive(data?.recentViolations ?? []);
    },
    [tenantId, fetchOverviewData],
  );


   /* ---------- DERIVED DATA ---------- */
   const fireSmokeKpiData = useMemo(() => {
     return displayFireSmokeKpi.map((item) => {
 const config = fireSmokeDetectionKpiConfig[item.title];
       return {
         title: item.title,
         value: item.value,
         icon: config?.icon || EngineeringIcon,
         tooltipMessage: config?.tooltipMessage,
       };
     });
   }, [displayFireSmokeKpi]);
 
   const zoneViolationsForUi = useMemo(() => {
    const iconMap: Record<string, SvgIconComponent> = {
      fire: LocalFireDepartment,
      smoke: SmokeFree,
    };

    return displayFireSmokeZoneViolations.map((z) => ({
      ...z,
      subViolations: z.subViolations?.map((s) => ({
        ...s,
        icon: iconMap[s.label],
      })),
    }));
  }, [displayFireSmokeZoneViolations]);
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
      id: "incident",
      label: t("Incident"),
      type: "select" as const,
      options: ["Fire detected", "Smoke detected"],
    },
    {
      id: "zone",
      label: t("Zone"),
      type: "select" as const,

      options: fireSmokeDetailedReport?.zones || [],
    },
    {
      id: "camera",
      label: t("Cameras"),
      type: "select" as const,

      options: fireSmokeDetailedReport?.cameras || [],
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
    (filters: FireSmokeDetectionFilterParams) => {
      console.log("filter params", filters);
      setFireSmokePage(0); // ← set page FIRST
      setFireSmokeFilters(filters); // ← then filters
      // React batches both → useEffect fires exactly ONCE
    },
    [], // no deps needed
  );
  const handleReset = useCallback(() => {
    setFireSmokeFilters({});
    setFireSmokePage(0);
  }, []);

  const handleExport = useCallback(

    async (format: "csv" | "pdf", filters: FireSmokeDetectionFilterParams) => {
      try {
        setIsExporting(true);
        const payload = {
          tenantId,
          incident: filters.incident || undefined,
          zone: filters.zone || undefined,
          camera: filters.camera || undefined,
          startDate: formatLocalDateTime(filters.startDate),
          endDate: formatLocalDateTime(filters.endDate),
        };

        // ================= CSV =================
        if (format === "csv") {
          await downloadFireSmokeDetectionCsvReport(payload);
        }

        // ================= PDF =================
        if (format === "pdf") {
          await downloadFireSmokeDetectionPdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      } finally {
        setIsExporting(false); // ✅ STOP LOADER
      }

    },
    [
      tenantId,
      downloadFireSmokeDetectionCsvReport,
      downloadFireSmokeDetectionPdfReport,
      formatLocalDateTime,
    ],
  );

  const handleDownloadSingle = useCallback(
    async (row: FireSmokeDetectionViolation, index: number) => {
      try {
        setDownloadingRows((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
        const payload = {
          tenantId,
         // incident: String(row.incident),
          
        incident: String(
          row.incident ??
          row.violation ??
          "Unknown Incident"
        ),
          zone: row.zone,
          time: row.time,
          // camera: row.camera,
          camera: row.camera || row.cameraName,
          imageUrl: row.imageUrl,
          alarmTriggered: row.alarmTriggered,

        };

        await downloadFireSmokeDetectionSinglePdf(payload);
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
    [tenantId, downloadFireSmokeDetectionSinglePdf],
  );

  const handleViewSingle = useCallback((row: FireSmokeDetectionViolation) => {
    console.log("view single row", row);
    setViewPopupData(row);
    setViewPopupOpen(true);
  }, []);

  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const fireSmokeIncident = violation as FireSmokeDetectionViolation;
    console.log('download singel from reccent',fireSmokeIncident)
    try {
      const payload = {
        tenantId: tenantId,
        // incident: String(fireSmokeIncident.incident),
        incident:
    fireSmokeIncident.incident ??
    fireSmokeIncident.violation ??
    "Unknown Incident",
        zone: fireSmokeIncident.zone,
        time: fireSmokeIncident.time,
        // camera: fireSmokeIncident.camera,
         camera: fireSmokeIncident.camera ?? fireSmokeIncident.cameraName,
        imageUrl: url,
        alarmTriggered: fireSmokeIncident.alarmTriggered,
      };

      await downloadFireSmokeDetectionSinglePdf(payload);
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
            onRangeChange={handleFireSmokeRangeChange}
            shifts={fireSmokeOrgShifts || []}
          />
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {overviewLoading || !fireSmokeKpiData.length
            ? Array.from({ length: 6 }).map((_, index) => (
              <Grid
                key={index + 1}
                size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              >
                <KpiCardSkeleton />
              </Grid>
            ))
            : fireSmokeKpiData.map((kpi) => (
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
              violations={fireSmokeRecentViolationsLive}
              loading={overviewLoading}
              tooltipMessage="Latest 20 detected fire or smoke incidents with details."
              onDownload={handleDownloadViolation}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label={t("Zone Incidents")}
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows fire or smoke incidents per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      <ReportTable
        title={t("Detailed Report")}
        tooltipMessage="Detailed fire or smoke incidents report with filter, reset, and CSV/PDF download options."
        data={fireSmokeDetailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(row as FireSmokeDetectionViolation, index)
        }
        downloadingRows={downloadingRows}

        onView={(row) => handleViewSingle(row as FireSmokeDetectionViolation)}
        downloadFileName="fire-smoke-detection-report"
        loading={FireSmokeDetailedReportLoading}
        totalCount={fireSmokeDetailedReport?.total || 0}
        page={fireSmokePage}
        rowsPerPage={fireSmokeLimit}
        onPageChange={(newPage) => setFireSmokePage(newPage)}
        onRowsPerPageChange={(rows) => {
          setFireSmokeLimit(rows);
          setFireSmokePage(0);
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

export default FireSmokeDetection;
