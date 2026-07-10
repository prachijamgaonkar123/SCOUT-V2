import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";

import { rtkAPIToast } from "@/utils/rtkAPIToast";
import {
  EmployeeIdleTimeCsvReportRequest,
  EmployeeIdleTimeSingleReportRequest,
  ShiftType,
} from "./EmployeeIdelTime.types";
export const employeeIdleTimeMonitoringApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeIdleTimeDetectionKpiData: builder.query({
      query: (body) => ({
        url: `${apiRoutes.employeeIdleTimeMonitoring.root}/${apiRoutes.employeeIdleTimeMonitoring.getEmployeeIdleTimeMonitoringAnalyticsKpi}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeeIdleTimeKpi"],
    }),

    getEmployeeIdleTimeDetectionZoneViolations: builder.query({
      query: (body: {
        tenantId: string;
        startDate?: string;
        endDate?: string;
      }) => ({
        url: `${apiRoutes.employeeIdleTimeMonitoring.root}/${apiRoutes.employeeIdleTimeMonitoring.getEmployeeIdleTimeMonitoringAnalyticsZoneViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeeIdleTimeZoneViolations"],
    }),

    getEmployeeIdleTimeDetectionDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.employeeIdleTimeMonitoring.root}/${apiRoutes.employeeIdleTimeMonitoring.getEmployeeIdleTimeMonitoringAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeeIdleTimeDetailedReport"],
    }),

    getEmployeeIdleTimeDetectionRecentViolations: builder.query({
      query: (body) => ({
        url: `${apiRoutes.employeeIdleTimeMonitoring.root}/${apiRoutes.employeeIdleTimeMonitoring.getEmployeeIdleTimeMonitoringAnalyticsRecentViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["EmployeeIdleTimeRecentViolations"],
    }),

    //report

    getEmployeeIdleTimeDetectionSingleReportPdf: builder.mutation<
      null,
      EmployeeIdleTimeSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeeIdleTimeMonitoring.root}/${apiRoutes.employeeIdleTimeMonitoring.getEmployeeIdleTimeMonitoringAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employee-idle-time-single-report-${Date.now()}.pdf`;
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
            "Employee idle time detection single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the employee idle time detection single PDF report.",
          duration: 4000,
        });
      },
    }),

    getEmployeeIdleTimeDetectionDetailedCsvReport: builder.mutation<
      null,
      EmployeeIdleTimeCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeeIdleTimeMonitoring.root}/${apiRoutes.employeeIdleTimeMonitoring.getEmployeeIdleTimeMonitoringAnalyticsDownloadDetailedCsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `employee-idle-time-csv-report-${Date.now()}.csv`;
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
            "Employee idle time detection detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download the employee idle time detection detailed CSV report.",
          duration: 4000,
        });
      },
    }),

    getEmployeeIdleTimeDetectionDetailedPdfReport: builder.mutation<
      null,
      EmployeeIdleTimeCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.employeeIdleTimeMonitoring.root}/${apiRoutes.employeeIdleTimeMonitoring.getEmployeeIdleTimeMonitoringAnalyticsDownloadDetailedPdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employee-idle-time-detailed-report-${Date.now()}.pdf`;
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
            "Employee idle time detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the employee idle time detailed report. Please try again.",
          duration: 4000,
        });
      },
    }),

    getOrgShiftTimeEmpIdelData: builder.query<
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
  useGetOrgShiftTimeEmpIdelDataQuery,
  useLazyGetEmployeeIdleTimeDetectionKpiDataQuery,
  useLazyGetEmployeeIdleTimeDetectionZoneViolationsQuery,
  useLazyGetEmployeeIdleTimeDetectionDetailedReportQuery,
  useLazyGetEmployeeIdleTimeDetectionRecentViolationsQuery,
  useGetEmployeeIdleTimeDetectionSingleReportPdfMutation,
  useGetEmployeeIdleTimeDetectionDetailedCsvReportMutation,
  useGetEmployeeIdleTimeDetectionDetailedPdfReportMutation,
} = employeeIdleTimeMonitoringApi;
