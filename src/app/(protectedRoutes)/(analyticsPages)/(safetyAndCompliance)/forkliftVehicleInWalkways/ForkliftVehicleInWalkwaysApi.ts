import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { rtkAPIToast } from "@/utils/rtkAPIToast";
import { CrowdGatheringInHazardousZonesReportRequest, CrowdGatheringInHazardousZonesSingleReportRequest } from "../crowdGathering/CrowdGathering.types";
import { ShiftType } from "./ForkliftVehicleInWalkways.types";


export const forkliftVehicleInWalkwaysApi =
  baseProtectedApi.injectEndpoints({
    endpoints: (builder) => ({

      // =========================
      // KPI + Zone + Recent
      // =========================

      getForkliftVehicleInWalkwaysData: builder.query({
        query: (body) => ({
          url: `${apiRoutes.forkliftVehicleInWalkways.root}/${apiRoutes.forkliftVehicleInWalkways.getForkliftVehicleInWalkwaysAnalyticsData}`,

          method: "POST",

          body,
        }),

        providesTags: ["ForkliftVehicleInWalkwaysAnalytics"],
      }),

      // =========================
      // Detailed Report
      // =========================

      getForkliftVehicleInWalkwaysDetailedReport: builder.query({
        query: (body) => ({
          url: `${apiRoutes.forkliftVehicleInWalkways.root}/${apiRoutes.forkliftVehicleInWalkways.getForkliftVehicleInWalkwaysAnalyticsDetailedReport}`,

          method: "POST",

          body,
        }),

        providesTags: ["ForkliftVehicleInWalkwaysDetailedReport"],
      }),

      // =========================
      // Single PDF Report
      // =========================

      getForkliftVehicleInWalkwaysSingleReportPdf: builder.mutation<
        null,
        CrowdGatheringInHazardousZonesSingleReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.forkliftVehicleInWalkways.root}/${apiRoutes.forkliftVehicleInWalkways.getForkliftVehicleInWalkwaysAnalyticsDownloadDetailedReportForSingleId}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `forklift-vehicle-in-walkways-single-report-${Date.now()}.pdf`;

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
              "Forklift vehicle in walkways single PDF report downloaded successfully.",

            errorMessage:
              "Failed to download forklift vehicle in walkways single PDF report.",

            duration: 4000,
          });
        },
      }),

      // =========================
      // CSV Report
      // =========================

      getForkliftVehicleInWalkwaysDetailedCsvReport: builder.mutation<
        null,
        CrowdGatheringInHazardousZonesReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.forkliftVehicleInWalkways.root}/${apiRoutes.forkliftVehicleInWalkways.getForkliftVehicleInWalkwaysAnalyticsDownloadDetailedCSVReport}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `forklift-vehicle-in-walkways-report-${Date.now()}.csv`;

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
              "Forklift vehicle in walkways detailed CSV report downloaded successfully.",

            errorMessage:
              "Failed to download forklift vehicle in walkways detailed CSV report.",

            duration: 4000,
          });
        },
      }),

      // =========================
      // Detailed PDF Report
      // =========================

      getForkliftVehicleInWalkwaysDetailedPdfReport: builder.mutation<
        null,
        CrowdGatheringInHazardousZonesReportRequest
      >({
        query: (body) => ({
          url: `${apiRoutes.forkliftVehicleInWalkways.root}/${apiRoutes.forkliftVehicleInWalkways.getForkliftVehicleInWalkwaysAnalyticsDownloadDetailedPdfReport}`,

          method: "POST",

          body,

          responseHandler: async (response) => {
            const blob = await response.blob();

            const url = globalThis.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = `forklift-vehicle-in-walkways-report-${Date.now()}.pdf`;

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
              "Forklift vehicle in walkways detailed PDF report downloaded successfully.",

            errorMessage:
              "Failed to download forklift vehicle in walkways detailed PDF report.",

            duration: 4000,
          });
        },
      }),

      // =========================
      // Shift Timing
      // =========================

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

  useLazyGetForkliftVehicleInWalkwaysDataQuery,

  useLazyGetForkliftVehicleInWalkwaysDetailedReportQuery,

  useGetForkliftVehicleInWalkwaysSingleReportPdfMutation,

  useGetForkliftVehicleInWalkwaysDetailedCsvReportMutation,

  useGetForkliftVehicleInWalkwaysDetailedPdfReportMutation,
} = forkliftVehicleInWalkwaysApi;