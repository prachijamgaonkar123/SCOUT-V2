import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import {
  IntrusionBaseRequest,
  IntrusionCsvReportRequest,
  IntrusionDetailedReportRequest,
  IntrusionSingleReportRequest,
  ShiftType,
} from "./IntrusionDetection.types";
import { rtkAPIToast } from "@/utils/rtkAPIToast";

export const intrusionDetectionApi = baseProtectedApi.injectEndpoints({
  // overrideExisting: true,
  endpoints: (builder) => ({
    getIntrusionKpi: builder.query({
      query: (body: IntrusionBaseRequest) => ({
        url: `${apiRoutes.intrusionDetectionAtPremisesPerimeter.root}/${apiRoutes.intrusionDetectionAtPremisesPerimeter.getIntrusionDetectionAnalyticsKpi}`,
        method: "POST",
        body,
      }),
      providesTags: ["IntrusionKpi"],
    }),

    getIntrusionZoneViolations: builder.query({
      query: (body: IntrusionBaseRequest) => ({
        url: `${apiRoutes.intrusionDetectionAtPremisesPerimeter.root}/${apiRoutes.intrusionDetectionAtPremisesPerimeter.getIntrusionDetectionAnalyticsZoneViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["IntrusionZoneViolations"],
    }),

    getIntrusionRecentViolations: builder.query({
      query: (body: IntrusionBaseRequest) => ({
        url: `${apiRoutes.intrusionDetectionAtPremisesPerimeter.root}/${apiRoutes.intrusionDetectionAtPremisesPerimeter.getIntrusionDetectionAnalyticsRecentViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["IntrusionRecentViolations"],
    }),

    getIntrusionDetailedReport: builder.query({
      query: (body: IntrusionDetailedReportRequest) => ({
        url: `${apiRoutes.intrusionDetectionAtPremisesPerimeter.root}/${apiRoutes.intrusionDetectionAtPremisesPerimeter.getIntrusionDetectionAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["IntrusionDetailedReport"],
    }),

    getIntrusionDetectionSingleReportPdf: builder.mutation<
      null,
      IntrusionSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.intrusionDetectionAtPremisesPerimeter.root}/${apiRoutes.intrusionDetectionAtPremisesPerimeter.getIntrusionDetectionAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `intrusion-single-report-${Date.now()}.pdf`;
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
            "Intrusion detection single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the Intrusion detection single PDF report.",
          duration: 4000,
        });
      },
    }),

    getIntrusionDetectionDetailedCsvReport: builder.mutation<
      null,
      IntrusionCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.intrusionDetectionAtPremisesPerimeter.root}/${apiRoutes.intrusionDetectionAtPremisesPerimeter.getIntrusionDetectionAnalyticsDownloadDetailedCsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `intrusion-csv-report-${Date.now()}.csv`;
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
            "Intrusion detection detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download the Intrusion detection detailed CSV report.",
          duration: 4000,
        });
      },
    }),

    getIntrusionDetectionDetailedPdfReport: builder.mutation<
      null,
      IntrusionCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.intrusionDetectionAtPremisesPerimeter.root}/${apiRoutes.intrusionDetectionAtPremisesPerimeter.getIntrusionDetectionAnalyticsDownloadDetailedPdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `intrusion-detailed-report-${Date.now()}.pdf`;
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
            "Intrusion detection detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the Intrusion detailed report. Please try again.",
          duration: 4000,
        });
      },
    }),

    getOrgShiftTimeIntrusionData: builder.query<
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
  useGetOrgShiftTimeIntrusionDataQuery,
  useLazyGetIntrusionKpiQuery,
  useLazyGetIntrusionZoneViolationsQuery,
  useLazyGetIntrusionRecentViolationsQuery,
  useLazyGetIntrusionDetailedReportQuery,
  useGetIntrusionDetectionSingleReportPdfMutation,
  useGetIntrusionDetectionDetailedCsvReportMutation,
  useGetIntrusionDetectionDetailedPdfReportMutation,
} = intrusionDetectionApi;
