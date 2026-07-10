import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { rtkAPIToast } from "@/utils/rtkAPIToast";
import { CrowdGatheringInHazardousZonesReportRequest, CrowdGatheringInHazardousZonesSingleReportRequest, ShiftType } from "./CrowdGathering.types";

export const crowdGatheringInHazardousZonesApi =
  baseProtectedApi.injectEndpoints({
    endpoints: (builder) => ({

      // ---------------------------
      // KPI + Zone + Recent
      // ---------------------------
      getCrowdGatheringInHazardousZonesData: builder.query({
        query: (body) => ({
          url: `${apiRoutes.crowdGatheringInHazardousZones.root}/${apiRoutes.crowdGatheringInHazardousZones.getCrowdGatheringInHazardousZonesAnalyticsData}`,
          method: "POST",
          body,
        }),

        providesTags: ["CrowdGatheringAnalytics"],
      }),

      // ---------------------------
      // Detailed Report
      // ---------------------------
      getCrowdGatheringInHazardousZonesDetailedReport: builder.query({
        query: (body) => ({
          url: `${apiRoutes.crowdGatheringInHazardousZones.root}/${apiRoutes.crowdGatheringInHazardousZones.getCrowdGatheringInHazardousZonesAnalyticsDetailedReport}`,
          method: "POST",
          body,
        }),

        providesTags: ["CrowdGatheringDetailedReport"],
      }),

      // ---------------------------
      // Single PDF Report
      // ---------------------------
      getCrowdGatheringSingleReportPdf: builder.mutation<
        null,
        CrowdGatheringInHazardousZonesSingleReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.crowdGatheringInHazardousZones.root}/${apiRoutes.crowdGatheringInHazardousZones.getCrowdGatheringInHazardousZonesAnalyticsDownloadDetailedReportForSingleId}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `crowd-gathering-single-report-${Date.now()}.pdf`;

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
              "Crowd gathering single PDF report downloaded successfully.",

            errorMessage:
              "Failed to download crowd gathering single PDF report.",

            duration: 4000,
          });
        },
      }),

      // ---------------------------
      // CSV Report
      // ---------------------------
      getCrowdGatheringDetailedCsvReport: builder.mutation<
        null,
        CrowdGatheringInHazardousZonesReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.crowdGatheringInHazardousZones.root}/${apiRoutes.crowdGatheringInHazardousZones.getCrowdGatheringInHazardousZonesAnalyticsDownloadDetailedCSVReport}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `crowd-gathering-report-${Date.now()}.csv`;

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
              "Crowd gathering detailed CSV report downloaded successfully.",

            errorMessage:
              "Failed to download crowd gathering detailed CSV report.",

            duration: 4000,
          });
        },
      }),

      // ---------------------------
      // Detailed PDF Report
      // ---------------------------
      getCrowdGatheringDetailedPdfReport: builder.mutation<
        null,
        CrowdGatheringInHazardousZonesReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.crowdGatheringInHazardousZones.root}/${apiRoutes.crowdGatheringInHazardousZones.getCrowdGatheringInHazardousZonesAnalyticsDownloadDetailedPdfReport}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `crowd-gathering-report-${Date.now()}.pdf`;

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
              "Crowd gathering detailed PDF report downloaded successfully.",

            errorMessage:
              "Failed to download crowd gathering detailed PDF report.",

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

  useLazyGetCrowdGatheringInHazardousZonesDataQuery,

  useLazyGetCrowdGatheringInHazardousZonesDetailedReportQuery,

  useGetCrowdGatheringSingleReportPdfMutation,

  useGetCrowdGatheringDetailedCsvReportMutation,

  useGetCrowdGatheringDetailedPdfReportMutation,
} = crowdGatheringInHazardousZonesApi;