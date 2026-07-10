import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { ShiftType, UnauthorizedAccessInRestrictedAreasReportRequest, UnauthorizedAccessInRestrictedAreasSingleReportRequest, UnauthorizedAccessResponse } from "./UnauthorizedAccessInRestrictedAreas.types";
import { rtkAPIToast } from "@/utils/rtkAPIToast";
import { hideToast, showToast } from "@/app/store/slices/toasterSlice"
type ApiError = {
  data?: { message?: string };
  error?: { data?: { message?: string } };
  message?: string;
};;

export const unauthorizedAccessInRestrictedAreasApi =
  baseProtectedApi.injectEndpoints({
    endpoints: (builder) => ({
        
      getUnauthorizedAccessInRestrictedAreasData: builder.query<
  UnauthorizedAccessResponse,
  { tenantId: string; startDate?: string; endDate?: string }
>({
        query: (body) => ({
          url: `${apiRoutes.unauthorizedAccessInRestrictedAreas.root}/${apiRoutes.unauthorizedAccessInRestrictedAreas.getUnauthorizedAccessInRestrictedAreasAnalyticsData}`,
          method: "POST",
          body,
        }),
        providesTags: ["UnauthorizedAccessData"],
      }),

      getUnauthorizedAccessInRestrictedAreasDetailedReport: builder.query({
        query: (body) => ({
          url: `${apiRoutes.unauthorizedAccessInRestrictedAreas.root}/${apiRoutes.unauthorizedAccessInRestrictedAreas.getUnauthorizedAccessInRestrictedAreasAnalyticsDetailedReport}`,
          method: "POST",
          body,
        }),
        providesTags: ["UnauthorizedAccessDetailedReport"],
      }),

      getOrgShiftTimeUnauthorizedAccessInRestrictedAreasData: builder.query<
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


          getUnauthorizedAccessInRestrictedAreasDetailedPdfReport: builder.mutation<
            null,
            UnauthorizedAccessInRestrictedAreasReportRequest
          >({
            query: (body) => ({
              url: `${apiRoutes.unauthorizedAccessInRestrictedAreas.root}/${apiRoutes.unauthorizedAccessInRestrictedAreas.getUnauthorizedAccessInRestrictedAreasAnalyticsDownloadPdfDetailedReport}`,
              method: "POST",
              body,
              responseHandler: async (response) => {
                const blob = await response.blob();
      
                // ✅ Create browser download inside the mutation
                const url = globalThis.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Unauthorized-Access-In-Restricted-Areas-Report-${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                globalThis.URL.revokeObjectURL(url);
      
                return null; // ✅ Must return something serializable for Redux
              },
            }),
          async onQueryStarted(arg, { dispatch, queryFulfilled }) {
  try {
    await rtkAPIToast(queryFulfilled, dispatch, {
      successMessage:
        "Unauthorized Access In Restricted Areas detailed report has been downloaded successfully.",
      errorMessage:
        "Failed to download the Unauthorized Access report. Please try again.",
      duration: 5000,
    });
  } catch (error: unknown) {
    // ✅ MANUAL fallback handling
    // const backendMessage =
    //   error?.data?.message ||
    //   error?.error?.data?.message ||
    //   error?.message;


const err = error as ApiError;
  const backendMessage =
    err?.data?.message ||
    err?.error?.data?.message ||
    err?.message

    dispatch(
      showToast({
        message:
          backendMessage ||
          "Too much data records. Please select a smaller date range",
        severity: "warning", // 👈 important
      })
    );

    setTimeout(() => {
      dispatch(hideToast());
    }, 5000);
  }
}
          }),
      
          getUnauthorizedAccessInRestrictedAreasDetailedCsvReport: builder.mutation<
            null,
            UnauthorizedAccessInRestrictedAreasReportRequest
          >({
            query: (body) => ({
              url: `${apiRoutes.unauthorizedAccessInRestrictedAreas.root}/${apiRoutes.unauthorizedAccessInRestrictedAreas.getUnauthorizedAccessInRestrictedAreasAnalyticsDownloadCSVDetailedReport}`,
              method: "POST",
              body,
              responseHandler: async (response) => {
                const blob = await response.blob();
      
                const url = globalThis.URL.createObjectURL(blob);
                const a = document.createElement("a");
      
                a.href = url;
                a.download = `Unauthorized-Access-In-Restricted-Areas-Report-${Date.now()}.csv`;
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
                  "Unauthorized Access In Restricted Areas  CSV report downloaded successfully.",
                errorMessage:
                  "Failed to download the Unauthorized Access In Restricted Areas  detailed CSV report.",
                duration: 4000,
              });
            },
          }),
          getUnauthorizedAccessInRestrictedAreasSingleReportPdf: builder.mutation<
            null,
            UnauthorizedAccessInRestrictedAreasSingleReportRequest
          >({
            query: (body) => ({
              url: `${apiRoutes.unauthorizedAccessInRestrictedAreas.root}/${apiRoutes.unauthorizedAccessInRestrictedAreas.getUnauthorizedAccessInRestrictedAreasAnalyticsDownloadDetailedReportForSingleId}`,
              method: "POST",
              body,
              responseHandler: async (response) => {
                const blob = await response.blob();
      
                // ✅ Create browser download
                const url = globalThis.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Unauthorized-Access-In-Restricted-Areas-Single-Report-${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                globalThis.URL.revokeObjectURL(url);
      
                return null;
              },
            }),

                
          }),
    }),
  });
  export const {
  useGetUnauthorizedAccessInRestrictedAreasDataQuery,
  useLazyGetUnauthorizedAccessInRestrictedAreasDataQuery,
  useGetUnauthorizedAccessInRestrictedAreasDetailedReportQuery,
  useLazyGetUnauthorizedAccessInRestrictedAreasDetailedReportQuery,
  useGetOrgShiftTimeUnauthorizedAccessInRestrictedAreasDataQuery,
  useGetUnauthorizedAccessInRestrictedAreasDetailedCsvReportMutation,
  useGetUnauthorizedAccessInRestrictedAreasDetailedPdfReportMutation,
  useGetUnauthorizedAccessInRestrictedAreasSingleReportPdfMutation

} = unauthorizedAccessInRestrictedAreasApi;