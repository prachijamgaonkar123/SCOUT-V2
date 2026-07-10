"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";

import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import WorkOffIcon from "@mui/icons-material/WorkOff";
import {
  EmployeeIdleTimeDetailedReportResponse,
  EmployeeIdelTimeFilterParams,
  EmployeeIdleKpiItem,
  EmployeeIdleTimeSocketPayload,
  EmployeeIdleTimeViolation,
  EmployeeIdleZoneViolation,
} from "./EmployeeIdelTime.types";
import {
  useGetEmployeeIdleTimeDetectionDetailedCsvReportMutation,
  useGetEmployeeIdleTimeDetectionDetailedPdfReportMutation,
  useGetEmployeeIdleTimeDetectionSingleReportPdfMutation,
  useGetOrgShiftTimeEmpIdelDataQuery,
  useLazyGetEmployeeIdleTimeDetectionDetailedReportQuery,
  useLazyGetEmployeeIdleTimeDetectionKpiDataQuery,
  useLazyGetEmployeeIdleTimeDetectionRecentViolationsQuery,
  useLazyGetEmployeeIdleTimeDetectionZoneViolationsQuery,
} from "./EmployeeIdelTimeApi";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { EmployeeIdelTimeKpiConfig } from "./EmployeeIdelTimeConfig";
import { SvgIconComponent } from "@mui/icons-material";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";

const EmployeeIdleTime: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [empIdelFilters, setEmpIdelFilters] =
    useState<EmployeeIdelTimeFilterParams>({});

  const [empIdelPage, setEmpIdelPage] = useState(0);
  const [empIdelLimit, setEmpIdelLimit] = useState(10);

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<EmployeeIdleTimeViolation | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);

  const [displayEmployeeIdelTimeKpi, setDisplayEmployeeIdelTimeKpi] = useState<
    EmployeeIdleKpiItem[]
  >([]);
  const [
    displayEmployeeIdelTimeZoneViolations,
    setDisplayEmployeeIdelTimeZoneViolations,
  ] = useState<EmployeeIdleZoneViolation[]>([]);
  const [recentViolationsLive, setRecentViolationsLive] = useState<
    EmployeeIdleTimeViolation[]
  >([]);

  const [employeeIdleTimeDetailedReport, setEmployeeIdleTimeDetailedReport] =
    useState<EmployeeIdleTimeDetailedReportResponse | null>(null);
  const [isExporting, setIsExporting] = useState(false);//report loader
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(new Set());//single report loader of report table

  /* ---------- API HOOKS ---------- */

  const { data: orgShifts } = useGetOrgShiftTimeEmpIdelDataQuery(
    { tenantId },
    { skip: !tenantId },
  );
  const [fetchEmployeeIdelTimeKpi, { isFetching: EmployeeIdelTimeKpiLoading }] =
    useLazyGetEmployeeIdleTimeDetectionKpiDataQuery();
  const [
    fetchEmployeeIdelTimeZoneViolations,
    { isLoading: EmployeeIdelTimeZoneLoading },
  ] = useLazyGetEmployeeIdleTimeDetectionZoneViolationsQuery();
  const [
    fetchEmployeeIdelTimeRecent,
    { isLoading: EmployeeIdelTimeRecentLoading },
  ] = useLazyGetEmployeeIdleTimeDetectionRecentViolationsQuery();
  const [
    fetchEmployeeIdelTimeDetailedReportApi,
    { isFetching: EmployeeIdelTimeDetailedReportLoading },
  ] = useLazyGetEmployeeIdleTimeDetectionDetailedReportQuery();

  const [downloadEmpIdelTimeSinglePdf] =
    useGetEmployeeIdleTimeDetectionSingleReportPdfMutation();
  const [downloadEmpIdelTimeCsvReport] =
    useGetEmployeeIdleTimeDetectionDetailedCsvReportMutation();
  const [downloadEmpIdelTimePdfReport] =
    useGetEmployeeIdleTimeDetectionDetailedPdfReportMutation();

  /* ---------- INITIAL LOAD ---------- */

  useEffect(() => {
    if (!tenantId) return;

    const loadInitial = async () => {
      const [kpi, zones, recent] = await Promise.all([
        fetchEmployeeIdelTimeKpi({ tenantId }).unwrap(),
        fetchEmployeeIdelTimeZoneViolations({ tenantId }).unwrap(),
        fetchEmployeeIdelTimeRecent({ tenantId }).unwrap(),
      ]);

      setDisplayEmployeeIdelTimeKpi(kpi ?? []);
      setDisplayEmployeeIdelTimeZoneViolations(zones ?? []);
      setRecentViolationsLive(recent ?? []);
    };

    loadInitial().catch(console.error);
  }, [
    tenantId,
    fetchEmployeeIdelTimeKpi,
    fetchEmployeeIdelTimeZoneViolations,
    fetchEmployeeIdelTimeRecent,
  ]);
  useEffect(() => {
    if (!tenantId) return;

    const loadDetailedReport = async () => {
      const body = {
        tenantId,
        page: empIdelPage + 1,
        limit: empIdelLimit,
        violation: empIdelFilters?.violation || undefined,
        zone: empIdelFilters?.zone || undefined,
        cameraId: empIdelFilters?.cameraId || undefined,
        startDate: formatLocalDateTime(empIdelFilters?.startDate),
        endDate: formatLocalDateTime(empIdelFilters?.endDate),
      };

      const response =
        await fetchEmployeeIdelTimeDetailedReportApi(body).unwrap();

      setEmployeeIdleTimeDetailedReport(response);
    };

    loadDetailedReport().catch(console.error);
  }, [
    tenantId,
    empIdelPage,
    empIdelLimit,
    empIdelFilters,
    fetchEmployeeIdelTimeDetailedReportApi,
  ]);
  /* ---------- SOCKET (LIVE ONLY) ---------- */
  useSocketEvent<EmployeeIdleTimeSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.EMPLOYEE_IDLE_UPDATE,
    handler: (payload) => {
      console.log("payload form the socket", payload);
      setDisplayEmployeeIdelTimeKpi(payload.kpi ?? []);
      setDisplayEmployeeIdelTimeZoneViolations(payload.zoneViolations ?? []);
      setRecentViolationsLive(payload.recentViolations ?? []);
    },
  });
  /* ---------- TIME FILTER ---------- */
  const handleEmpIdelTimeRangeChange = useCallback(
    async (range: { start?: string; end?: string }) => {
      if (!range.start && !range.end) {
        setIsLiveMode(true);

        // ✅ CALL ALL APIs + SET STATE
        const [kpi, zones, recent] = await Promise.all([
          fetchEmployeeIdelTimeKpi({ tenantId }).unwrap(),
          fetchEmployeeIdelTimeZoneViolations({ tenantId }).unwrap(),
          fetchEmployeeIdelTimeRecent({ tenantId }).unwrap(),
        ]);

        setDisplayEmployeeIdelTimeKpi(kpi ?? []);
        setDisplayEmployeeIdelTimeZoneViolations(zones ?? []);
        setRecentViolationsLive(recent ?? []);
        return;
      }

      setIsLiveMode(false);
      const payload = {
        tenantId: tenantId,
        startDate: range.start,
        endDate: range.end,
      };
      const [kpi, zones, recent] = await Promise.all([
        fetchEmployeeIdelTimeKpi(payload).unwrap(),
        fetchEmployeeIdelTimeZoneViolations(payload).unwrap(),
        fetchEmployeeIdelTimeRecent(payload).unwrap(),
      ]);

      setDisplayEmployeeIdelTimeKpi(kpi ?? []);
      setDisplayEmployeeIdelTimeZoneViolations(zones ?? []);
      setRecentViolationsLive(recent ?? []);
    },
    [
      tenantId,
      fetchEmployeeIdelTimeKpi,
      fetchEmployeeIdelTimeZoneViolations,
      fetchEmployeeIdelTimeRecent,
    ],
  );
  const employeeIdleTimeKpiData = useMemo(
    () =>
      displayEmployeeIdelTimeKpi.map((item) => {
        const config = EmployeeIdelTimeKpiConfig[item.title];

        return {
          ...item,
          title: t(item.title),
          icon: config?.icon || EngineeringIcon,
          tooltipMessage: config?.tooltipMessage || "",
        };
      }),
    [displayEmployeeIdelTimeKpi, t],
  );
  const zoneViolationsForUi = useMemo(() => {
    const iconMap: Record<string, SvgIconComponent> = {
      Idle: AccessTimeIcon,
      Working: WorkOutlineIcon,
      "Not Working": WorkOffIcon,
    };

    return displayEmployeeIdelTimeZoneViolations.map((z) => ({
      ...z,
      subViolations: z.subViolations?.map((s) => ({
        ...s,
        icon: iconMap[s.label],
      })),
    }));
  }, [displayEmployeeIdelTimeZoneViolations]);

  /* ---------- REPORT HANDLERS ---------- */

  const tableColumns = [
    { id: "violation", label: t("Violation") },
    { id: "time", label: t("Time") },
    { id: "zone", label: t("Zone") },
    { id: "cameraId", label: t("Cameras") },
  ];

  const tableFilters = [
    {
      id: "violation",
      label: t("Violation"),
      type: "select" as const,
      options: ["Employee Idle", "Employee Working", "Employee Not Present"],
    },
    {
      id: "zone",
      label: t("Zone"),
      type: "select" as const,

      options: employeeIdleTimeDetailedReport?.zones || [],
    },
    {
      id: "cameraId",
      label: t("Cameras"),
      type: "select" as const,

      options: employeeIdleTimeDetailedReport?.cameras || [],
    },

    { id: "startDate", label: t("Start Date"), type: "date" as const },
    { id: "endDate", label: t("End Date"), type: "date" as const },
  ];

  const handleSubmitFilter = useCallback(
    (filters: EmployeeIdelTimeFilterParams) => {
      console.log("filter params", filters);
      setEmpIdelPage(0); // ← set page FIRST
      setEmpIdelFilters(filters); // ← then filters
      // React batches both → useEffect fires exactly ONCE
    },
    [], // no deps needed
  );
  const handleReset = useCallback(() => {
    setEmpIdelFilters({});
    setEmpIdelPage(0);
  }, []);

  const handleExport = useCallback(
    async (format: "csv" | "pdf", filters: EmployeeIdelTimeFilterParams) => {
      try {
        setIsExporting(true)
        const payload = {

          tenantId,
          violation: filters.violation || undefined,
          zone: filters.zone || undefined,
          cameraId: filters.cameraId || undefined,
          startDate: formatLocalDateTime(filters.startDate),
          endDate: formatLocalDateTime(filters.endDate),
        };

        // ================= CSV =================
        if (format === "csv") {
          await downloadEmpIdelTimeCsvReport(payload);
        }

        // ================= PDF =================
        if (format === "pdf") {
          await downloadEmpIdelTimePdfReport(payload).unwrap();
        }
      } catch (error) {
        console.error("❌ Export failed:", error);
      } finally {
        setIsExporting(false)
      }
    },
    [
      tenantId,
      downloadEmpIdelTimeCsvReport,
      downloadEmpIdelTimePdfReport,
      formatLocalDateTime,
    ],
  );

  const handleDownloadSingle = useCallback(
    async (row: EmployeeIdleTimeViolation, index: number) => {
      try {
        setDownloadingRows((prev) => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        }); const payload = {
          tenantId,
          violation: String(row.violation),
          zone: row.zone,
          time: row.time,
          cameraId: row.cameraId,
          imageUrl: row.imageUrl,
        };

        await downloadEmpIdelTimeSinglePdf(payload);
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
    [tenantId, downloadEmpIdelTimeSinglePdf],
  );

  const handleViewSingle = useCallback((row: EmployeeIdleTimeViolation) => {
    console.log("view single row", row);
    setViewPopupData(row);
    setViewPopupOpen(true);
  }, []);

  const handleDownloadViolation = async (url: string, violation: Violation) => {
    if (!violation) return;
    const empViolation = violation as EmployeeIdleTimeViolation;
    console.log("employee idel time single data=============", empViolation);
    try {
      const payload = {
        tenantId: tenantId,
        violation: String(empViolation.violation),
        zone: empViolation.zone,
        time: empViolation.time,
        cameraId: empViolation.cameraId,
        imageUrl: url,
      };

      await downloadEmpIdelTimeSinglePdf(payload);
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
            onRangeChange={handleEmpIdelTimeRangeChange}
            shifts={orgShifts || []}
          />
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {EmployeeIdelTimeKpiLoading || !employeeIdleTimeKpiData.length
            ? Array.from({ length: 6 }).map((_, index) => (
              <Grid
                key={index + 1}
                size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              >
                <KpiCardSkeleton />
              </Grid>
            ))
            : employeeIdleTimeKpiData.map((kpi) => (
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
              violations={recentViolationsLive}
              loading={EmployeeIdelTimeRecentLoading}
              tooltipMessage="Latest 20 detected idel, working,not present employee with details."
              onDownload={handleDownloadViolation}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              label={t("Zone Violations")}
              violationsZone={zoneViolationsForUi}
              loading={EmployeeIdelTimeZoneLoading}
              tooltipMessage="Shows idel, working,not present employee per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      <ReportTable
        title={t("Detailed Report")}
        tooltipMessage="Detailed idle time events report with filter, reset, and CSV/PDF download options."
        data={employeeIdleTimeDetailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}

        onDownload={(row, index) =>
          handleDownloadSingle(row as EmployeeIdleTimeViolation, index)
        }
        downloadingRows={downloadingRows}
        onView={(row) => handleViewSingle(row as EmployeeIdleTimeViolation)}
        downloadFileName="employee-idle-time-report"
        loading={EmployeeIdelTimeDetailedReportLoading}
        totalCount={employeeIdleTimeDetailedReport?.total || 0}
        page={empIdelPage}
        rowsPerPage={empIdelLimit}
        onPageChange={(newPage) => setEmpIdelPage(newPage)}
        onRowsPerPageChange={(rows) => {
          setEmpIdelLimit(rows);
          setEmpIdelPage(0);
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

export default EmployeeIdleTime;
