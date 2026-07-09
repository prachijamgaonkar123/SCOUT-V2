"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";

import EngineeringIcon from "@mui/icons-material/Engineering";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { SvgIconComponent } from "@mui/icons-material";

import {
  useLazyGetPPEKitDetectionKpiDataQuery,
  useLazyGetPPEKitDetectionZoneViolationsQuery,
  useLazyGetPpeKitDetectionRecentViolationsQuery,
  useLazyGetPpeKitDetectionDetailedReportQuery,
  useGetPpeKitDetectionDetailedCsvReportMutation,
  useGetPpeKitDetectionDetailedPdfReportMutation,
  useGetPpeKitDetectionSingleReportPdfMutation,
} from "./PPEKitDetectionApi";

import { ppeKpiConfig } from "./PPEKitDetectionConfig";
import {
  KpiItem,
  ZoneViolationInteface,
  FilterParams,
  PPEViolation,
  PpeSocketPayload,
  DetailedReportResponse,
} from "./PPEKitDetection.types";

import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { useSocketEvent } from "@/customhooks/useSocketEvent";

import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import ViolationsTrend, { TrendDataPoint } from "@/app/components/molecules/ViolationsTrend/ViolationsTrend";
import ViolationBreakdown, { BreakdownItem } from "@/app/components/molecules/ViolationBreakdown/ViolationBreakdown";

/* ================= COMPONENT ================= */

const PPEDetection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [isLiveMode, setIsLiveMode] = useState(true);

  const [displayKpi, setDisplayKpi] = useState<KpiItem[]>([]);
  const [displayZoneViolations, setDisplayZoneViolations] = useState<
    ZoneViolationInteface[]
  >([]);
  const [recentViolationsLive, setRecentViolationsLive] = useState<
    PPEViolation[]
  >([]);
  const [detailedReport, setDetailedReport] =
    useState<DetailedReportResponse | null>(null);

  const [viewPopupOpen, setViewPopupOpen] = useState(false);

  const [viewPopupData, setViewPopupData] = useState<PPEViolation | null>(null);
  const [isExporting, setIsExporting] = useState(false);//report loader
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());//single report loader of report table

  /* ---------- API HOOKS ---------- */
  const [fetchKpi, { isLoading: kpiLoading }] =
    useLazyGetPPEKitDetectionKpiDataQuery();
  const [fetchZoneViolations, { isLoading: zoneLoading }] =
    useLazyGetPPEKitDetectionZoneViolationsQuery();
  const [fetchRecent, { isLoading: recentLoading }] =
    useLazyGetPpeKitDetectionRecentViolationsQuery();
  const [fetchDetailedReportApi, { isLoading: reportLoading }] =
    useLazyGetPpeKitDetectionDetailedReportQuery();
  const [downloadSinglePdf] = useGetPpeKitDetectionSingleReportPdfMutation();
  const [downloadCsvReport] = useGetPpeKitDetectionDetailedCsvReportMutation();
  const [downloadPdfReport] = useGetPpeKitDetectionDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    const load = async () => {
      const [kpi, zones, recent, detailed] = await Promise.all([
        fetchKpi({ tenantId }).unwrap(),
        fetchZoneViolations({ tenantId }).unwrap(),
        fetchRecent({ tenantId }).unwrap(),
        fetchDetailedReportApi({ tenantId }).unwrap(),
      ]);

      setDisplayKpi(kpi ?? []);
      setDisplayZoneViolations(zones ?? []);
      setRecentViolationsLive(recent ?? []);
      setDetailedReport(detailed);
    };

    load().catch(console.error);
  }, [
    tenantId,
    fetchKpi,
    fetchZoneViolations,
    fetchRecent,
    fetchDetailedReportApi,
  ]);

  /* ---------- SOCKET (LIVE ONLY) ---------- */
  useSocketEvent<PpeSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.PPE_UPDATE,
    handler: (payload) => {
      console.log("payload form the socket", payload);
      setDisplayKpi(payload.kpi ?? []);
      setDisplayZoneViolations(payload.zoneViolations ?? []);
      setRecentViolationsLive(payload.recentViolations ?? []);
    },
  });

  /* ---------- TIME FILTER ---------- */
  const handleTimeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        setIsLiveMode(true);
        fetchKpi({ tenantId });
        fetchZoneViolations({ tenantId });
        fetchRecent({ tenantId });
        return;
      }

      setIsLiveMode(false);
      const payload = {
        tenantId: tenantId,
        startDate: range.start,
        endDate: range.end,
      };
      const [kpi, zones, recent] = await Promise.all([
        fetchKpi(payload).unwrap(),
        fetchZoneViolations(payload).unwrap(),
        fetchRecent(payload).unwrap(),
      ]);

      setDisplayKpi(kpi ?? []);
      setDisplayZoneViolations(zones ?? []);
      setRecentViolationsLive(recent ?? []);
    },
    [tenantId, fetchKpi, fetchZoneViolations, fetchRecent],
  );
// -------- Derived data for new components --------
const breakdownData = useMemo(() => {
  const breakdownItems: BreakdownItem[] = [];
  let total = 0;

  displayKpi.forEach((item) => {
    if (item.title === "Total Violations") {
      total = Number(item.value);
    } else {
      // Only include non‑total items as breakdown categories
      breakdownItems.push({
        label: item.title,
        count: Number(item.value),
      });
    }
  });

  return { total, breakdownItems };
}, [displayKpi]);

const lastDetectionTime = useMemo(() => {
  if (recentViolationsLive.length === 0) return "--:--:--";
  // Sort by time descending and take the latest
  const sorted = [...recentViolationsLive].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
  const latest = sorted[0];
  return latest.time ? new Date(latest.time).toLocaleTimeString() : "--:--:--";
}, [recentViolationsLive]);

// ⚠️ Replace with real trend data from an API later
const trendData = useMemo<TrendDataPoint[]>(
  () => [
    { date: "Jun 25", value: 4 },
    { date: "Jun 26", value: 6 },
    { date: "Jun 27", value: 3 },
    { date: "Jun 28", value: 8 },
    { date: "Jun 29", value: 5 },
    { date: "Jun 30", value: 7 },
    { date: "Jul 01", value: 9 },
  ],
  []
);

const trendPercentage = useMemo(() => 18, []);
  const ppeKpiData = useMemo(
    () =>
      displayKpi.map((item) => {
        const config = ppeKpiConfig[item.title];

        return {
          ...item,
          title: t(item.title),
          icon: config?.icon || EngineeringIcon,
          tooltipMessage: config?.tooltipMessage || "",
        };
      }),
    [displayKpi, t],
  );
  const zoneViolationsForUi = useMemo(() => {
    const iconMap: Record<string, SvgIconComponent> = {
      Helmet: EngineeringIcon,
      Vest: CheckroomIcon,
      Glasses: VisibilityOffIcon,
    };

    return displayZoneViolations.map((z) => ({
      ...z,
      subViolations: z.subViolations?.map((s) => ({
        ...s,
        icon: iconMap[s.label],
      })),
    }));
  }, [displayZoneViolations]);

  /* ---------- REPORT HANDLERS ---------- */

  const tableColumns = [
    { id: "violation", label: t("Violation") },
    { id: "time", label: t("Time") },
    { id: "zone", label: t("Zone") },
    { id: "cameraId", label: t("Cameras") },
    { id: "alarmTriggered", label: t("Alarm Triggered") },
  ];

  const tableFilters = [
    {
      id: "violation",
      label: t("Violation"),
      type: "select" as const,
      options: [
        "Hard hat missing",
        "Safety vest not worn",
        "Safety glasses missing",
      ],
    },
    {
      id: "zone",
      label: t("Zone"),
      type: "select" as const,

      options: detailedReport?.zones || [],
    },
    {
      id: "cameraId",
      label: t("Cameras"),
      type: "select" as const,

      options: detailedReport?.cameras || [],
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
    async (filters: FilterParams) => {
      console.log("filter params", filters);

      const body = {
        tenantId: tenantId,

        violation: filters.violation || undefined,
        zone: filters.zone || undefined,
        cameraId: filters.cameraId || undefined,

        alarmTriggered:
          filters.alarmTriggered === undefined
            ? undefined
            : filters.alarmTriggered === "True",
        startDate: formatLocalDateTime(filters.startDate),
        endDate: formatLocalDateTime(filters.endDate),
      };

      console.log("🚀 Sending payload:", body);

      const response = await fetchDetailedReportApi(body).unwrap();
      setDetailedReport(response);
    },
    [tenantId, fetchDetailedReportApi, formatLocalDateTime],
  );

  const handleReset = useCallback(async () => {
    const response = await fetchDetailedReportApi({
      tenantId: tenantId,
    }).unwrap();
    setDetailedReport(response);
  }, [tenantId, fetchDetailedReportApi]);

  const handleExport = useCallback(
    async (format: "csv" | "pdf", filters: FilterParams) => {
      try {
        setIsExporting(true)
        const payload = {
          tenantId,

          violation: filters.violation || undefined,
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
          await downloadCsvReport(payload);
        }

        // ================= PDF =================
        if (format === "pdf") {
          await downloadPdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      } finally {
        setIsExporting(false)
      }
    },
    [tenantId, downloadCsvReport, downloadPdfReport, formatLocalDateTime],
  );

  const handleDownloadSingle = useCallback(
    async (row: PPEViolation, index: number) => {
      try {
        setDownloadingRows((prev) => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        });
        const payload = {
          tenantId,
          violation: String(row.violation),
          zone: row.zone,
          time: row.time,
          cameraId: row.cameraId,
          alarmTriggered: row.alarmTriggered,
          imageUrl: row.imageUrl,
        };

        await downloadSinglePdf(payload);
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
    [tenantId, downloadSinglePdf],
  );

  const handleViewSingle = useCallback(
    (row: PPEViolation) => {
      console.log("view single row", row);
      setViewPopupData(row);
      setViewPopupOpen(true);
    },
    [], // setState functions are stable
  );
  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const ppeViolation = violation as PPEViolation;
    try {
      const payload = {
        tenantId: tenantId,
        violation: String(ppeViolation.violation),
        zone: ppeViolation.zone,
        time: ppeViolation.time,
        cameraId: ppeViolation.cameraId,
        alarmTriggered: ppeViolation.alarmTriggered,
        imageUrl: url,
      };

      await downloadSinglePdf(payload);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <Box>
      <Paper sx={{ p: 3, backgroundColor: "#fff", borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">📊 {t("Overview")}</Typography>
          <TimeFilter onRangeChange={handleTimeRangeChange} />
        </Box>

        {/* <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {kpiLoading
            ? Array.from({ length: 6 }).map((_, index) => (
              <Grid
                key={index + 1}
                size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              >
                <KpiCardSkeleton />
              </Grid>
            ))
            : ppeKpiData.map((kpi) => (
              <Grid
                key={kpi.title}
                size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              >
                <KpiCard {...kpi} />
              </Grid>
            ))}
        </Grid> */}
<Grid container spacing={3} sx={{ mb: 4 }}>
  {/* Violation Breakdown – left column */}
  <Grid size={{ xs: 12, md: 6 }}>
    {kpiLoading ? (
      <Box sx={{ height: 220, bgcolor: "#f5f5f5", borderRadius: 2 }} />
    ) : (
      <ViolationBreakdown
        totalViolations={breakdownData.total}
        breakdown={breakdownData.breakdownItems}
        lastDetection={lastDetectionTime}
      />
    )}
  </Grid>

  {/* Violations Trend – right column */}
  <Grid size={{ xs: 12, md: 6 }}>
    {kpiLoading ? (
      <Box sx={{ height: 220, bgcolor: "#f5f5f5", borderRadius: 2 }} />
    ) : (
      <ViolationsTrend
        data={trendData}
        trendPercentage={trendPercentage}
        trendLabel="↑"
      />
    )}
  </Grid>
</Grid>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RecentViolations
              label={t("Recent Violations")}
              violations={recentViolationsLive}
              loading={recentLoading}
              tooltipMessage="Latest 20 detected PPE violations"
              onDownload={handleDownloadViolation}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label={t("Zone Violations")}
              violationsZone={zoneViolationsForUi}
              loading={zoneLoading}
              tooltipMessage="Shows PPE violations per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      <ReportTable
        totalCount={4}
        page={0}
        rowsPerPage={10}
        title={t("Detailed Report")}
        tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
        data={detailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={(row, index) => handleDownloadSingle(row as PPEViolation, index)}
        exportLoading={isExporting}
        downloadingRows={downloadingRows}
        onView={(row) => handleViewSingle(row as PPEViolation)}
        downloadFileName="ppe-violations-report"
        loading={reportLoading}
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

export default PPEDetection;
