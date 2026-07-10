import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { FallDetectionReportRequest, FallDetectionSingleReportRequest, ShiftType } from "./fallDetection.types";
import { rtkAPIToast } from "@/utils/rtkAPIToast";

export const fallLaydownDetectionApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
    getFallLaydownDetectionKpiData: builder.query({
      query: (body) => ({
        url: `${apiRoutes.fallLaydownDetection.root}/${apiRoutes.fallLaydownDetection.getFallLaydownDetectionAnalyticsKpi}`,
        method: "POST",
        body,
      }),
      providesTags: ["FallLaydownDetectionKpi"],
    }),

    getFallLaydownDetectionZoneViolations: builder.query({
      query: (body: {
        tenantId: string;
        startDate?: string;
        endDate?: string;
      }) => ({
        url: `${apiRoutes.fallLaydownDetection.root}/${apiRoutes.fallLaydownDetection.getFallLaydownDetectionAnalyticsZoneViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["FallLaydownDetectionZoneViolations"],
    }),

    getFallLaydownDetectionDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.fallLaydownDetection.root}/${apiRoutes.fallLaydownDetection.getFallLaydownDetectionAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["FallLaydownDetectionDetailedReport"],
    }),

    getFallLaydownDetectionRecentViolations: builder.query({
      query: (body) => ({
        url: `${apiRoutes.fallLaydownDetection.root}/${apiRoutes.fallLaydownDetection.getFallLaydownDetectionAnalyticsRecentViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["FallLaydownDetectionRecentViolations"],
    }),

    getFallDetectionDetailedPdfReport: builder.mutation<
      null,
      FallDetectionReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.fallLaydownDetection.root}/${apiRoutes.fallLaydownDetection.getFallLaydownDetectionAnalyticsDownloadDetailedReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Fall-Detection-Detailed-Report-${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          globalThis.URL.revokeObjectURL(url);

          return null; // ✅ Must return something serializable for Redux
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await rtkAPIToast(queryFulfilled, dispatch, {
          successMessage:
            "Fall detection detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the Fall detection detailed report. Please try again.",
          duration: 5000,
        });
      },
    }),

    getFallDetectionDetailedCsvReport: builder.mutation<
      null,
      FallDetectionReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.fallLaydownDetection.root}/${apiRoutes.fallLaydownDetection.getFallDetectionAnalyticsDownloadDetailedCsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `Fall-Detection-Report-${Date.now()}.csv`;
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
            "Fall detection detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download the Fall detection detailed CSV report.",
          duration: 4000,
        });
      },
    }),
    getFallDetectionSingleReportPdf: builder.mutation<
      null,
      FallDetectionSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.fallLaydownDetection.root}/${apiRoutes.fallLaydownDetection.getFallLaydownDetectionAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Fall-Detection-Single-Report-${Date.now()}.pdf`;
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
            "Fall detection single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the Fall detection single PDF report.",
          duration: 4000,
        });
      },
    }),

    getOrgShiftTimeFallLaydownData: builder.query<
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
  useGetOrgShiftTimeFallLaydownDataQuery,
  useLazyGetFallLaydownDetectionKpiDataQuery,
  useLazyGetFallLaydownDetectionZoneViolationsQuery,
  useLazyGetFallLaydownDetectionDetailedReportQuery,
  useLazyGetFallLaydownDetectionRecentViolationsQuery,
  useGetFallDetectionDetailedPdfReportMutation,
  useGetFallDetectionSingleReportPdfMutation,
  useGetFallDetectionDetailedCsvReportMutation
} = fallLaydownDetectionApi;
