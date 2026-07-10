import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { FireSmokeDetectionReportRequest, FireSmokeDetectionResponse, FireSmokeDetectionSingleReportRequest, ShiftType } from "./fireSmokeDetection.types";
import { rtkAPIToast } from "@/utils/rtkAPIToast";

export const fireSmokeDetectionApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
   

    getFireSmokeDetectionDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.fireSmokeDetection.root}/${apiRoutes.fireSmokeDetection.getFireSmokeDetectionAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["FireSmokeDetectionDetailedReport"],
    }),

   
      getFireSmokeDetectionData: builder.query<
  FireSmokeDetectionResponse,
  { tenantId: string; startDate?: string; endDate?: string }
>({
        query: (body) => ({
            url: `${apiRoutes.fireSmokeDetection.root}/${apiRoutes.fireSmokeDetection.getFireSmokeDetectionAnalyticsData}`,
       
        
          method: "POST",
          body,
        }), 
        providesTags: ["FireSmokeDetectionData"],
      }),

    getFireSmokeDetectionDetailedPdfReport: builder.mutation<
      null,
      FireSmokeDetectionReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.fireSmokeDetection.root}/${apiRoutes.fireSmokeDetection.getFireSmokeDetectionAnalyticsDownloadDetailedReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `FireSmoke-Detection-Detailed-Report-${Date.now()}.pdf`;
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
            "Fire Smoke detection detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the Fire Smoke detailed report. Please try again.",
          duration: 5000,
        });
      },
    }),

    getFireSmokeDetectionDetailedCsvReport: builder.mutation<
      null,
      FireSmokeDetectionReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.fireSmokeDetection.root}/${apiRoutes.fireSmokeDetection.getFireSmokeDetectionAnalyticsDownloadDetailedCsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `FireSmoke-Detection-Report-${Date.now()}.csv`;
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
            "Fire Smoke detection detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download the Fire Smoke detection detailed CSV report.",
          duration: 4000,
        });
      },
    }),
    getFireSmokeDetectionSingleReportPdf: builder.mutation<
      null,
      FireSmokeDetectionSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.fireSmokeDetection.root}/${apiRoutes.fireSmokeDetection.getFireSmokeDetectionAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `FireSmoke-Detection-Single-Report-${Date.now()}.pdf`;
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
            "Fire Smoke detection single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the Fire Smoke detection single PDF report.",
          duration: 4000,
        });
      },
    }),
    getOrgShiftTimeFireSmokeData: builder.query<
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
  useGetOrgShiftTimeFireSmokeDataQuery,
  useLazyGetFireSmokeDetectionDetailedReportQuery,
  useLazyGetFireSmokeDetectionDataQuery,
  useGetFireSmokeDetectionDetailedPdfReportMutation,
  useGetFireSmokeDetectionDetailedCsvReportMutation,
  useGetFireSmokeDetectionSingleReportPdfMutation
} = fireSmokeDetectionApi;
