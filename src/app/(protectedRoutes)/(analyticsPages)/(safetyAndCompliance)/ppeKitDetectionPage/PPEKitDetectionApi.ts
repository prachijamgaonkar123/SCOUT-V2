import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import {
  PpeCsvReportRequest,
  PpeSingleReportRequest,
} from "./PPEKitDetection.types";
import { rtkAPIToast } from "@/utils/rtkAPIToast";
export const ppeKitDetectionApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
    getPPEKitDetectionKpiData: builder.query({
      query: (body) => ({
        url: `${apiRoutes.ppeKitDetection.root}/${apiRoutes.ppeKitDetection.getPpeKitDetectionAnalyticsKpi}`,
        method: "POST",
        body,
      }),
      providesTags: ["PPEKpi"],
    }),

    getPPEKitDetectionZoneViolations: builder.query({
      query: (body: {
        tenantId: string;
        startDate?: string;
        endDate?: string;
      }) => ({
        url: `${apiRoutes.ppeKitDetection.root}/${apiRoutes.ppeKitDetection.getPpeKitDetectionAnalyticsZoneViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["PpeZoneViolations"],
    }),

    getPpeKitDetectionDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.ppeKitDetection.root}/${apiRoutes.ppeKitDetection.getPpeKitDetectionAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["PpeDetailedReport"],
    }),

    getPpeKitDetectionRecentViolations: builder.query({
      query: (body) => ({
        url: `${apiRoutes.ppeKitDetection.root}/${apiRoutes.ppeKitDetection.getPpeKitDetectionAnalyticsRecentViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["PpeRecentViolations"],
    }),

    getPpeKitDetectionSingleReportPdf: builder.mutation<
      null,
      PpeSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.ppeKitDetection.root}/${apiRoutes.ppeKitDetection.getPpeKitDetectionAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ppe-single-report-${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          globalThis.URL.revokeObjectURL(url);

          return null; // ✅ Must return something serializable
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await rtkAPIToast(queryFulfilled, dispatch, {
          successMessage:
            "PPE detection single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the PPE detection single PDF report.",
          duration: 4000,
        });
      },
    }),

    getPpeKitDetectionDetailedCsvReport: builder.mutation<
      null,
      PpeCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.ppeKitDetection.root}/${apiRoutes.ppeKitDetection.getPpeKitDetectionAnalyticsDownloadDetailedCsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `ppe-csv-report-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();

          a.remove();
          globalThis.URL.revokeObjectURL(url);

          return null; // ✅ MUST return something
        },
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await rtkAPIToast(queryFulfilled, dispatch, {
          successMessage:
            "PPE detection detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download the PPE detection detailed CSV report.",
          duration: 4000,
        });
      },
    }),

    getPpeKitDetectionDetailedPdfReport: builder.mutation<
      null,
      PpeCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.ppeKitDetection.root}/${apiRoutes.ppeKitDetection.getPpeKitDetectionAnalyticsDownloadDetailedPdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ppe-detailed-report-${Date.now()}.pdf`;
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
            "PPE detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the PPE detailed report. Please try again.",
          duration: 4000,
        });
      },
    }),
  }),
});

export const {
  useLazyGetPPEKitDetectionKpiDataQuery,
  useLazyGetPPEKitDetectionZoneViolationsQuery,
  useLazyGetPpeKitDetectionDetailedReportQuery,
  useLazyGetPpeKitDetectionRecentViolationsQuery,
  useGetPpeKitDetectionSingleReportPdfMutation,
  useGetPpeKitDetectionDetailedCsvReportMutation,
  useGetPpeKitDetectionDetailedPdfReportMutation,
} = ppeKitDetectionApi;
