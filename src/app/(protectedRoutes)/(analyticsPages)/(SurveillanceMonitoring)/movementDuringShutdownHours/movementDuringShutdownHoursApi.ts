import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { rtkAPIToast } from "@/utils/rtkAPIToast";
import {
  MovemnetDuringShutDownHrBaseRequest,
  MovemnetDuringShutDownHrCsvReportRequest,
  MovemnetDuringShutDownHrDetailedReportRequest,
  MovemnetDuringShutDownHrSingleReportRequest,
  ShiftTypeMovement,
} from "./movementDuringShutdownHours.types";

export const movemnetDuringShutDownHrApi = baseProtectedApi.injectEndpoints({
  // overrideExisting: true,
  endpoints: (builder) => ({
    getMovementDuringShutdownHoursKpi: builder.query({
      query: (body: MovemnetDuringShutDownHrBaseRequest) => ({
        url: `${apiRoutes.MovementDuringShutdownHours.root}/${apiRoutes.MovementDuringShutdownHours.getMovementDuringShutdownHoursAnalyticsKpi}`,
        method: "POST",
        body,
      }),
      providesTags: ["MovementDuringShutdownHoursKpi"],
    }),

    getMovementDuringShutdownHoursZoneViolations: builder.query({
      query: (body: MovemnetDuringShutDownHrBaseRequest) => ({
        url: `${apiRoutes.MovementDuringShutdownHours.root}/${apiRoutes.MovementDuringShutdownHours.getMovementDuringShutdownHoursAnalyticsZoneViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["MovementDuringShutdownHoursZoneViolations"],
    }),

    getMovementDuringShutdownHoursRecentViolations: builder.query({
      query: (body: MovemnetDuringShutDownHrBaseRequest) => ({
        url: `${apiRoutes.MovementDuringShutdownHours.root}/${apiRoutes.MovementDuringShutdownHours.getMovementDuringShutdownHoursAnalyticsRecentViolations}`,
        method: "POST",
        body,
      }),
      providesTags: ["MovementDuringShutdownHoursRecentViolations"],
    }),

    getMovementDuringShutdownHoursDetailedReport: builder.query({
      query: (body: MovemnetDuringShutDownHrDetailedReportRequest) => ({
        url: `${apiRoutes.MovementDuringShutdownHours.root}/${apiRoutes.MovementDuringShutdownHours.getMovementDuringShutdownHoursAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["MovementDuringShutdownHoursDetailedReport"],
    }),

    getMovementDuringShutdownHoursSingleReportPdf: builder.mutation<
      null,
      MovemnetDuringShutDownHrSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.MovementDuringShutdownHours.root}/${apiRoutes.MovementDuringShutdownHours.getMovementDuringShutdownHoursAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `movement-during-shutdown-hour-single-report-${Date.now()}.pdf`;
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
            "Movement during shutdown hour single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download the movement during shutdown hour single PDF report.",
          duration: 4000,
        });
      },
    }),

    getMovementDuringShutdownHoursDetailedCsvReport: builder.mutation<
      null,
      MovemnetDuringShutDownHrCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.MovementDuringShutdownHours.root}/${apiRoutes.MovementDuringShutdownHours.getMovementDuringShutdownHoursAnalyticsDownloadDetailedCsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `movement-during-shutdown-hour-csv-report-${Date.now()}.csv`;
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
            "Movement during shutdown hour detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download the movement during shutdown hour detailed CSV report.",
          duration: 4000,
        });
      },
    }),

    getMovementDuringShutdownHoursDetailedPdfReport: builder.mutation<
      null,
      MovemnetDuringShutDownHrCsvReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.MovementDuringShutdownHours.root}/${apiRoutes.MovementDuringShutdownHours.getMovementDuringShutdownHoursAnalyticsDownloadDetailedPdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          // ✅ Create browser download inside the mutation
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `movement-during-shutdown-hour-detailed-report-${Date.now()}.pdf`;
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
            "Movement during shutdown hour detailed report has been downloaded successfully.",
          errorMessage:
            "Failed to download the movement during shutdown hour report. Please try again.",
          duration: 4000,
        });
      },
    }),

    getOrgShiftTimeMovementData: builder.query<
      ShiftTypeMovement[],
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
  useLazyGetMovementDuringShutdownHoursKpiQuery,
  useLazyGetMovementDuringShutdownHoursZoneViolationsQuery,
  useLazyGetMovementDuringShutdownHoursRecentViolationsQuery,
  useLazyGetMovementDuringShutdownHoursDetailedReportQuery,
  useGetMovementDuringShutdownHoursSingleReportPdfMutation,
  useGetMovementDuringShutdownHoursDetailedCsvReportMutation,
  useGetMovementDuringShutdownHoursDetailedPdfReportMutation,
  useGetOrgShiftTimeMovementDataQuery,
} = movemnetDuringShutDownHrApi;
