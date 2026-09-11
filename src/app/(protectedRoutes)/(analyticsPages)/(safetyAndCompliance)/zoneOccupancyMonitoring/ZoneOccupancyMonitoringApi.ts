import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { rtkAPIToast } from "@/utils/rtkAPIToast";
import { ZoneOccupancyMonitoringReportRequest, ZoneOccupancyMonitoringSingleReportRequest, ShiftType } from "./ZoneOccupancyMonitoring.types";

export const zoneOccupancyMonitoringApi =
  baseProtectedApi.injectEndpoints({
    endpoints: (builder) => ({

      // ---------------------------
      // KPI + Zone + Recent
      // ---------------------------
      getZoneOccupancyMonitoringData: builder.query({
        query: (body) => ({
          url: `${apiRoutes.zoneOccupancyMonitoring.root}/${apiRoutes.zoneOccupancyMonitoring.getZoneOccupancyMonitoringAnalyticsData}`,
          method: "POST",
          body,
        }),

        providesTags: ["ZoneOccupancyMonitoringAnalytics"],
      }),

      // ---------------------------
      // Detailed Report
      // ---------------------------
      getZoneOccupancyMonitoringDetailedReport: builder.query({
        query: (body) => ({
          url: `${apiRoutes.zoneOccupancyMonitoring.root}/${apiRoutes.zoneOccupancyMonitoring.getZoneOccupancyMonitoringAnalyticsDetailedReport}`,
          method: "POST",
          body,
        }),

        providesTags: ["ZoneOccupancyMonitoringDetailedReport"],
      }),

      // ---------------------------
      // Single PDF Report
      // ---------------------------
      getZoneOccupancyMonitoringSingleReportPdf: builder.mutation<
        null,
        ZoneOccupancyMonitoringSingleReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.zoneOccupancyMonitoring.root}/${apiRoutes.zoneOccupancyMonitoring.getZoneOccupancyMonitoringAnalyticsDownloadDetailedReportForSingleId}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `zone-occupancy-monitoring-single-report-${Date.now()}.pdf`;

            document.body.appendChild(a);

            a.click();

            a.remove();

            globalThis.URL.revokeObjectURL(url);

            return null;
          },
        }),

        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          await rtkAPIToast(queryFulfilled, dispatch, {
            successMessage:
              "Zone occupancy monitoring single PDF report downloaded successfully.",

            errorMessage:
              "Failed to download zone occupancy monitoring single PDF report.",

            duration: 4000,
          });
        },
      }),

      // ---------------------------
      // CSV Report
      // ---------------------------
      getZoneOccupancyMonitoringDetailedCsvReport: builder.mutation<
        null,
        ZoneOccupancyMonitoringReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.zoneOccupancyMonitoring.root}/${apiRoutes.zoneOccupancyMonitoring.getZoneOccupancyMonitoringAnalyticsDownloadDetailedCSVReport}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `zone-occupancy-monitoring-report-${Date.now()}.csv`;

            document.body.appendChild(a);

            a.click();

            a.remove();

            globalThis.URL.revokeObjectURL(url);

            return null;
          },
        }),

        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          await rtkAPIToast(queryFulfilled, dispatch, {
            successMessage:
              "Zone occupancy monitoring detailed CSV report downloaded successfully.",

            errorMessage:
              "Failed to download zone occupancy monitoring detailed CSV report.",

            duration: 4000,
          });
        },
      }),

      // ---------------------------
      // Detailed PDF Report
      // ---------------------------
      getZoneOccupancyMonitoringDetailedPdfReport: builder.mutation<
        null,
        ZoneOccupancyMonitoringReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.zoneOccupancyMonitoring.root}/${apiRoutes.zoneOccupancyMonitoring.getZoneOccupancyMonitoringAnalyticsDownloadDetailedPdfReport}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `zone-occupancy-monitoring-report-${Date.now()}.pdf`;

            document.body.appendChild(a);

            a.click();

            a.remove();

            globalThis.URL.revokeObjectURL(url);

            return null;
          },
        }),

        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          await rtkAPIToast(queryFulfilled, dispatch, {
            successMessage:
              "Zone occupancy monitoring detailed PDF report downloaded successfully.",

            errorMessage:
              "Failed to download zone occupancy monitoring detailed PDF report.",

            duration: 4000,
          });
        },
      }),

      // ---------------------------
      // Shift Timing
      // ---------------------------
      getOrgShiftTimeData: builder.query<
        ShiftType[],
        { tenantId: string }
      >({
        query: (body) => ({
          url: `${apiRoutes.authentication.root}/${apiRoutes.authentication.getOrgShiftTiming}`,

          method: "POST",

          body,
        }),

        providesTags: ["orgShiftTime"],
      }),
    }),
  });

export const {
  useGetOrgShiftTimeDataQuery,

  useLazyGetZoneOccupancyMonitoringDataQuery,

  useLazyGetZoneOccupancyMonitoringDetailedReportQuery,

  useGetZoneOccupancyMonitoringSingleReportPdfMutation,

  useGetZoneOccupancyMonitoringDetailedCsvReportMutation,

  useGetZoneOccupancyMonitoringDetailedPdfReportMutation,
} = zoneOccupancyMonitoringApi;
