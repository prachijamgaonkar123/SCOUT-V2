// "use client";
// import React, { useState } from "react";
// import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
// import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
// import { Box, Grid, Paper, Typography } from "@mui/material";
// import {
//   Groups,
//   ReportProblem,
//   LocationOn,
//   AccessTime,
// } from "@mui/icons-material";
// import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
// import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
// import { v4 as uuidv4 } from "uuid";
// import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
// import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolations";
// import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";

// const CrowdGathering: React.FC = () => {
//   interface ViolationRow {
//     voilation: string;
//     zone: string;
//     time: string;
//     imageUrl: string;
//     cameraId: string;
//     alarmTriggered: boolean;
//     mobCount: number;
//     [key: string]: string | number | boolean;
//   }
//   const [viewPopupOpen, setViewPopupOpen] = useState(false);
//   const [viewPopupData, setViewPopupData] = useState<ViolationRow | null>(null);
//   const skeletonKeys = Array.from({ length: 4 }, () => uuidv4());
//   const backendCrowdData = [
//     {
//       id: 701,
//       gatheredMore: true,
//       alarmTriggered: true,
//       mobCount: 25,
//       snapshot: "https://picsum.photos/400/200?random=21",
//       zone: "Hazard Zone A",
//       camera: "CAM-21",
//       createdAt: "2025-09-23 20:05",
//       updatedAt: "2025-09-23 20:06",
//     },
//     {
//       id: 702,
//       gatheredMore: true,
//       alarmTriggered: false,
//       mobCount: 12,
//       snapshot: "https://picsum.photos/400/200?random=22",
//       zone: "Hazard Zone B",
//       camera: "CAM-22",
//       createdAt: "2025-09-23 20:15",
//       updatedAt: "2025-09-23 20:16",
//     },
//     {
//       id: 703,
//       gatheredMore: true,
//       alarmTriggered: true,
//       mobCount: 25,
//       snapshot: "https://picsum.photos/400/200?random=21",
//       zone: "Hazard Zone A",
//       camera: "CAM-21",
//       createdAt: "2025-09-23 20:05",
//       updatedAt: "2025-09-23 20:06",
//     },
//     {
//       id: 704,
//       gatheredMore: true,
//       alarmTriggered: false,
//       mobCount: 12,
//       snapshot: "https://picsum.photos/400/200?random=22",
//       zone: "Hazard Zone B",
//       camera: "CAM-22",
//       createdAt: "2025-09-23 20:15",
//       updatedAt: "2025-09-23 20:16",
//     },
//   ];

//   const CrowdKpiData = [
//     {
//       title: "Total Incidents Detected",
//       value: "56",
//       icon: ReportProblem,
//       tooltipMessage:
//         "Shows the total number of crowd gathering incidents detected so far.",
//     },
//     {
//       title: "Crowded Zone",
//       value: "Zone B",
//       icon: Groups,
//       tooltipMessage:
//         "Displays the zone that currently has the highest crowd gathering.",
//     },

//     {
//       title: "Peak Crowd Density ",
//       value: "50 (Zone B)",
//       icon: LocationOn,
//       tooltipMessage:
//         "Shows the highest recorded crowd density along with the zone where it occurred.",
//       trendColor: "#f44336",
//       color: "#f44336",
//       bgColor: "#ffebee",
//       borderColor: "#f44336",
//       iconBg: "rgba(244, 67, 54, 0.1)",
//     },
//     {
//       title: "Last Incidence",
//       value: "09:45 AM",
//       icon: AccessTime,
//       tooltipMessage:
//         "Displays the timestamp of the most recent crowd gathering incident detected.",
//     },
//   ];

//   const recentCrowdViolations = backendCrowdData.map((item) => {
//     let violationMsg = "";

//     if (item.gatheredMore) {
//       violationMsg = `Crowd gathering detected `;
//     } else {
//       violationMsg = "No violation";
//     }

//     return {
//       voilation: violationMsg,
//       zone: item.zone,
//       time: item.createdAt,
//       imageUrl: item.snapshot,
//       cameraId: item.camera,
//       alarmTriggered: item.alarmTriggered,
//       mobCount: item.mobCount,
//     };
//   });

//   const zoneViolationsData = [
//     {
//       zone: "Hazard Zone A",
//       violations: 2,
//     },
//     {
//       zone: "Hazard Zone B",
//       violations: 2,
//     },
//   ];
//   interface FilterParams {
//     status?: string;
//     employeeName?: string;
//     startDate?: string;
//     endDate?: string;
//   }
//   const handleSubmitFilter = async (filters: FilterParams) => {
//     console.log("Selected Filters:", filters);
//   };

//   const handleReset = () => {
//     console.log("reset button clickedd");
//   };

//   const handleExport = (format: "csv" | "pdf") => {
//     console.log("Export requested clikcedd:", format);
//   };
//   const handleViewSingle = (row: Record<string, string | number | boolean>) => {
//     const violation = row as ViolationRow;
//     setViewPopupData(violation);
//     setViewPopupOpen(true);
//   };
//   const KpiCardLoading = false;
//   return (
//     <Box>
//       <Paper
//         sx={{
//           p: 3,
//           mb: 4,
//           backgroundColor: "#ffffff",
//           borderRadius: 2,
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 2,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 18 }}>
//               <Box component="span" sx={{ mr: 2 }}>
//                 📊 Overview
//               </Box>
//             </Typography>
//           </Box>

//           <TimeFilter onRangeChange={() => console.log("range chnaged")} />
//         </Box>
//         {/* KPI Cards */}

//         <Grid container spacing={2.5} sx={{ mb: 4 }} alignItems="stretch">
//           {KpiCardLoading
//             ? // Show skeletons while loading
//               skeletonKeys.map((index) => (
//                 <Grid
//                   size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
//                   key={uuidv4() + index}
//                 >
//                   <KpiCardSkeleton />
//                 </Grid>
//               ))
//             : // Show actual KPI cards
//               CrowdKpiData.map((kpi, index) => (
//                 <Grid
//                   size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
//                   key={uuidv4() + index}
//                 >
//                   <KpiCard {...kpi} />
//                 </Grid>
//               ))}
//         </Grid>

//         {/* Content Grid */}
//         <Grid container spacing={3}>
//           {/* Recent  Violations */}
//           <Grid size={{ xs: 12, lg: 8 }}>
//             <RecentViolations
//               label="Recent Violations"
//               violations={recentCrowdViolations}
//               loading={false}
//               tooltipMessage="Latest 20 detected crowd gathering violations with details."
//             />
//           </Grid>
//           {/*  Compliance by Zone */}

//           <Grid size={{ xs: 12, lg: 4 }}>
//             <ZoneViolations
//               violationsZone={zoneViolationsData}
//               loading={false}
//               tooltipMessage="Shows crowd gathered event per zone"
//             />
//           </Grid>
//         </Grid>
//       </Paper>

//       {/*  Violations Report */}
//       <ReportTable
//         totalCount={4}
//         page={0}
//         rowsPerPage={10}
//         title="Detailed Report"
//         columns={[
//           { id: "voilation", label: "Violation", minWidth: 200 },
//           { id: "mobCount", label: "People Count", minWidth: 120 },
//           { id: "time", label: "Time", minWidth: 150 },
//           { id: "zone", label: "Zone", minWidth: 150 },
//           { id: "cameraId", label: "Cameras", minWidth: 120 },
//           { id: "alarmTriggered", label: "Alarm Triggered", minWidth: 140 },
//         ]}
//         data={recentCrowdViolations}
//         filters={[
//           {
//             id: "zone",
//             label: "Zone",
//             type: "select",
//             options: Array.from(
//               new Set(recentCrowdViolations.map((item) => item.zone)),
//             ),
//           },
//           {
//             id: "cameraId",
//             label: "Cameras",
//             type: "select",
//             options: Array.from(
//               new Set(recentCrowdViolations.map((item) => item.cameraId)),
//             ),
//           },
//           {
//             id: "alarmTriggered",
//             label: "Alarm Triggered",
//             type: "select",
//             options: ["true", "false"],
//           },
//           { id: "time", label: "Start Date", type: "date" },
//           { id: "time", label: "End Date", type: "date" },
//         ]}
//         downloadFileName="crowd-gathering-report"
//         onSubmit={handleSubmitFilter}
//         onReset={handleReset}
//         onExport={handleExport}
//         loading={false}
//         onView={handleViewSingle}
//         tooltipMessage="Detailed violations report with filter, reset, and CSV/PDF download options."
//       />
//       {/* View Alert Popup */}
//       {viewPopupData && (
//         <ViewAlertPopup
//           open={viewPopupOpen}
//           handleClose={() => setViewPopupOpen(false)}
//           details={viewPopupData}
//           imageKey="imageUrl"
//           onDownload={(url) => console.log("Download:", url)}
//         />
//       )}
//     </Box>
//   );
// };

// export default CrowdGathering;

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReportTable from "@/app/components/organisms/ReportTable/ReportTable";
import { Box, Grid, Paper, Typography } from "@mui/material";
import KpiCard from "@/app/components/molecules/KpiCard/KpiCard";
import RecentViolations from "@/app/components/molecules/RecentViolations/RecentViolations";
import KpiCardSkeleton from "@/app/components/molecules/KpiCardSkeleton/KpiCardSkeleton";
import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";
import ZoneViolations from "@/app/components/organisms/ZoneViolations/ZoneViolationsOld";
import ViewAlertPopup from "@/app/components/molecules/ViewAlertPopup/ViewAlertPopup";
import {
  useGetOrgShiftTimeDataQuery,
  useGetCrowdGatheringSingleReportPdfMutation,
  useGetCrowdGatheringDetailedCsvReportMutation,
  useGetCrowdGatheringDetailedPdfReportMutation,
  useLazyGetCrowdGatheringInHazardousZonesDataQuery,
  useLazyGetCrowdGatheringInHazardousZonesDetailedReportQuery,
} from "./CrowdGatheringApi";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { useSocketEvent } from "@/customhooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/sockets/socket.events";
import { Violation } from "@/app/components/molecules/ViolationCard/ViolationCard";
import { CrowdGatheringKpiConfig } from "./CrowdGatheringConfig";
import {
  KpiColour,
  CrowdGatheringInHazardousZonesKpiItem,
  CrowdGatheringInHazardousZonesFilterParams,
  CrowdGatheringInHazardousZonesRecentViolation,
  CrowdGatheringInHazardousZonesSocketPayload,
  PeopleCountDetailedReportResponse,
} from "./CrowdGathering.types";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";

const CrowdGathering: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";

  /* ---------- STATE ---------- */
  const [filters, setFilters] =
    useState<CrowdGatheringInHazardousZonesFilterParams>({});
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingRows, setDownloadingRows] = useState<Set<number>>(
    new Set(),
  );
  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] =
    useState<CrowdGatheringInHazardousZonesRecentViolation | null>(null);

  // Live mode flag — false when time filter range is active
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Overview display state — fed by initial fetch, time filter fetch, OR socket
  const [displayKpi, setDisplayKpi] = useState<
    CrowdGatheringInHazardousZonesKpiItem[]
  >([]);
  const [displayZoneViolations, setDisplayZoneViolations] = useState<
    { zone: string; violations: number }[]
  >([]);
  const [recentViolationsLive, setRecentViolationsLive] = useState<
    CrowdGatheringInHazardousZonesRecentViolation[]
  >([]);

  const [detailedReport, setDetailedReport] =
    useState<PeopleCountDetailedReportResponse | null>(null);

  /* ---------- API HOOKS ---------- */
  const { data: orgShifts } = useGetOrgShiftTimeDataQuery(
    { tenantId },
    { skip: !tenantId },
  );

  // One call → gets kpi + zoneViolations + recentViolations together
  const [fetchOverviewData, { isFetching: overviewLoading }] =
    useLazyGetCrowdGatheringInHazardousZonesDataQuery();

  const [fetchDetailedReportApi, { isFetching: detailedReportLoading }] =
    useLazyGetCrowdGatheringInHazardousZonesDetailedReportQuery();

  const [downloadSinglePdf] = useGetCrowdGatheringSingleReportPdfMutation();
  const [downloadCsvReport] = useGetCrowdGatheringDetailedCsvReportMutation();
  const [downloadPdfReport] = useGetCrowdGatheringDetailedPdfReportMutation();

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
  useSocketEvent<CrowdGatheringInHazardousZonesSocketPayload>({
    tenantId,
    enabled: isLiveMode,
    event: SOCKET_EVENTS.CROWD_GATHERING_UPDATE,
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
      const config = CrowdGatheringKpiConfig[item.title];
      return {
        title: item.title,
        value: item.value,
        icon: config?.icon,
        tooltipMessage: config?.tooltipMessage,
        colour:item.color
      };
    });
  }, [displayKpi]);

  const zoneViolationsForUi = useMemo(() => {
    return displayZoneViolations.map((z) => ({
      zone: z.zone,
      violations: z.violations,
    }));
  }, [displayZoneViolations]);

  /* ---------- TABLE CONFIG ---------- */
  const tableColumns = [
    { id: "violation", label: "Violation", minWidth: 200 },
    { id: "peopleCount", label: "People Count", minWidth: 120 },
    { id: "time", label: "Time", minWidth: 150 },
    { id: "zone", label: "Zone", minWidth: 150 },
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
    (newFilters: CrowdGatheringInHazardousZonesFilterParams) => {
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
      exportFilters: CrowdGatheringInHazardousZonesFilterParams,
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
      row: CrowdGatheringInHazardousZonesRecentViolation,
      index: number,
    ) => {
      try {
        setDownloadingRows((prev) => new Set(prev).add(index));
        await downloadSinglePdf({
          tenantId,
          violation: String(row.violation),
          peopleCount: String(row.peopleCount ?? ""),
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
    (row: CrowdGatheringInHazardousZonesRecentViolation) => {
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
    const v = violation as CrowdGatheringInHazardousZonesRecentViolation;
    try {
      await downloadSinglePdf({
        tenantId,
        violation: String(v.violation),
        peopleCount: String(v.peopleCount ?? ""),
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
      <Paper sx={{ p: 3, mb: 4, backgroundColor: "#ffffff", borderRadius: 2 }}>
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
            ? Array.from({ length: 4 }).map((_, i) => (
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
              tooltipMessage="Latest 20 detected crowd gathering violations with details."
              violations={recentViolationsLive}
              loading={overviewLoading}
              onDownload={handleDownloadViolation}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ZoneViolations
              violationsZone={zoneViolationsForUi}
              loading={overviewLoading}
              tooltipMessage="Shows crowd gathered events per zone"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Report Table */}
      <ReportTable
        title="Detailed Report"
        tooltipMessage="Detailed crowd gathering report with filter, reset, and CSV/PDF download options."
        data={detailedReport?.data || []}
        columns={tableColumns}
        filters={tableFilters}
        onSubmit={handleSubmitFilter}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={isExporting}
        onDownload={(row, index) =>
          handleDownloadSingle(
            row as CrowdGatheringInHazardousZonesRecentViolation,
            index,
          )
        }
        downloadingRows={downloadingRows}
        onView={(row) =>
          handleViewSingle(
            row as CrowdGatheringInHazardousZonesRecentViolation,
          )
        }
        downloadFileName="crowd-gathering-report"
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

export default CrowdGathering;