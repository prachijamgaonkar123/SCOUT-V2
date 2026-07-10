import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";

import { rtkAPIToast } from "@/utils/rtkAPIToast";
import {
  
  EmployeePresenceRestrictedAreaReportRequest,
  EmployeePresenceRestrictedAreaSingleReportRequest,
  ShiftType,
} from "./EmployeePresenceRestrictedArea.types";
export const employeePresenceRestrictedAreaApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeePresenceRestrictedAreaData: builder.query({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInRestrictedAreas.root}/${apiRoutes.employeePresenceDetectionInRestrictedAreas.getEmployeePresenceDetectionInRestrictedAreasAnalyticsKpiRecentZoneViolation}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeePresenceRestrictedAreaData"],
    }),


    getEmployeePresenceRestrictedAreaDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInRestrictedAreas.root}/${apiRoutes.employeePresenceDetectionInRestrictedAreas.getEmployeePresenceDetectionInRestrictedAreasAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeePresenceRestrictedAreaDetailedReport"],
    }),

    //report

    getEmployeePresenceRestrictedAreaSingleReportPdf: builder.mutation<
      null,
      EmployeePresenceRestrictedAreaSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInRestrictedAreas.root}/${apiRoutes.employeePresenceDetectionInRestrictedAreas.getEmployeePresenceDetectionInRestrictedAreasAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employee-presence-in-restricted-area-single-report-${Date.now()}.pdf`;
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
            "Employee presence in restricted area  single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the employee presence in restricted area single PDF report.",
          duration: 4000,
        });
      },
    }),

    getEmployeePresenceRestrictedAreaDetailedCsvReport: builder.mutation<
      null,
      EmployeePresenceRestrictedAreaReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInRestrictedAreas.root}/${apiRoutes.employeePresenceDetectionInRestrictedAreas.getEmployeePresenceDetectionInRestrictedAreasAnalyticsDownloadDetailedcsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `employee-presence-in-restricted-area-report-${Date.now()}.csv`;
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
            "Employee presence in critical area detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download the Employee presence in critical area detection detailed CSV report.",
          duration: 4000,
        });
      },
    }),

    getEmployeePresenceRestrictedAreaDetailedPdfReport: builder.mutation<
      null,
      EmployeePresenceRestrictedAreaReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInRestrictedAreas.root}/${apiRoutes.employeePresenceDetectionInRestrictedAreas.getEmployeePresenceDetectionInRestrictedAreasAnalyticsDownloadDetailedpdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employee-presence-in-restricted-area-report-${Date.now()}.pdf`;
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
            "Employee presence in restricted area detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the Employee presence in restricted area detailed report. Please try again.",
          duration: 4000,
        });
      },
    }),

    getOrgShiftTimeEmpRestrictedData: builder.query<
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
  useGetOrgShiftTimeEmpRestrictedDataQuery,
  useLazyGetEmployeePresenceRestrictedAreaDetailedReportQuery,
  useGetEmployeePresenceRestrictedAreaSingleReportPdfMutation,
  useGetEmployeePresenceRestrictedAreaDetailedCsvReportMutation,
  useGetEmployeePresenceRestrictedAreaDetailedPdfReportMutation,
  useLazyGetEmployeePresenceRestrictedAreaDataQuery,
  
} = employeePresenceRestrictedAreaApi;
