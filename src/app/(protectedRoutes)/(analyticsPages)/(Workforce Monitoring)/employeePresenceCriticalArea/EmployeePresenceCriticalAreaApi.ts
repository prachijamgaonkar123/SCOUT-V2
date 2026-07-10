import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";

import { rtkAPIToast } from "@/utils/rtkAPIToast";
import {
  
  EmployeePresenceCriticalAreaReportRequest,
  EmployeePresenceCriticalAreaSingleReportRequest,
  ShiftType,
} from "./EmployeePresenceCriticalArea.types";
export const employeePresenceCriticalAreaApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeePresenceCriticalAreaData: builder.query({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInCriticalAreas.root}/${apiRoutes.employeePresenceDetectionInCriticalAreas.getEmployeePresenceDetectionInCriticalAreasAnalyticsKpiRecentZoneViolation}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeePresenceCriticalAreaData"],
    }),


    getEmployeePresenceCriticalAreaDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInCriticalAreas.root}/${apiRoutes.employeePresenceDetectionInCriticalAreas.getEmployeePresenceDetectionInCriticalAreasAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeePresenceCriticalAreaDetailedReport"],
    }),

    //report

    getEmployeePresenceCriticalAreaSingleReportPdf: builder.mutation<
      null,
      EmployeePresenceCriticalAreaSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInCriticalAreas.root}/${apiRoutes.employeePresenceDetectionInCriticalAreas.getEmployeePresenceDetectionInCriticalAreasAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employee-presence-in-critical-area-single-report-${Date.now()}.pdf`;
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
            "Employee presence in critical area  single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the employee presence in critical area single PDF report.",
          duration: 4000,
        });
      },
    }),

    getEmployeePresenceCriticalAreaDetailedCsvReport: builder.mutation<
      null,
      EmployeePresenceCriticalAreaReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInCriticalAreas.root}/${apiRoutes.employeePresenceDetectionInCriticalAreas.getEmployeePresenceDetectionInCriticalAreasAnalyticsDownloadDetailedcsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `employee-presence-in-critical-area-report-${Date.now()}.csv`;
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

    getEmployeePresenceCriticalAreaDetailedPdfReport: builder.mutation<
      null,
      EmployeePresenceCriticalAreaReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeePresenceDetectionInCriticalAreas.root}/${apiRoutes.employeePresenceDetectionInCriticalAreas.getEmployeePresenceDetectionInCriticalAreasAnalyticsDownloadDetailedpdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employee-presence-in-critical-area-report-${Date.now()}.pdf`;
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
            "Employee presence in critical area detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the Employee presence in critical area detailed report. Please try again.",
          duration: 4000,
        });
      },
    }),

    getOrgShiftTimeEmpCriticalData: builder.query<
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
  useGetOrgShiftTimeEmpCriticalDataQuery,
  useLazyGetEmployeePresenceCriticalAreaDetailedReportQuery,
  useGetEmployeePresenceCriticalAreaSingleReportPdfMutation,
  useGetEmployeePresenceCriticalAreaDetailedCsvReportMutation,
  useGetEmployeePresenceCriticalAreaDetailedPdfReportMutation,
  useLazyGetEmployeePresenceCriticalAreaDataQuery,
  
} = employeePresenceCriticalAreaApi;
