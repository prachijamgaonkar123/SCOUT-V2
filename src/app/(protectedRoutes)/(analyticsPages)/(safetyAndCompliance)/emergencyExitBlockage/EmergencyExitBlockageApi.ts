import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";

import { apiRoutes } from "@/constants/apiRoutes";

import { rtkAPIToast } from "@/utils/rtkAPIToast";


import { EmergencyExitBlockageReportRequest, EmergencyExitBlockageSingleReportRequest, ShiftType } from "./EmergencyExitBlockage.types";

export const emergencyExitBlockageDetectionApi =
  baseProtectedApi.injectEndpoints({
    endpoints: (builder) => ({

      // =========================
      // KPI + Zone + Recent
      // =========================

      getEmergencyExitBlockageDetectionData:
        builder.query({
          query: (body) => ({
            url: `${apiRoutes.emergencyExitBlockageDetection.root}/${apiRoutes.emergencyExitBlockageDetection.getEmergencyExitBlockageDetectionAnalyticsData}`,

            method: "POST",

            body,
          }),

          providesTags: [
            "EmergencyExitBlockageDetectionAnalytics",
          ],
        }),

      // =========================
      // Detailed Report
      // =========================

      getEmergencyExitBlockageDetectionDetailedReport:
        builder.query({
          query: (body) => ({
            url: `${apiRoutes.emergencyExitBlockageDetection.root}/${apiRoutes.emergencyExitBlockageDetection.getEmergencyExitBlockageDetectionAnalyticsDetailedReport}`,

            method: "POST",

            body,
          }),

          providesTags: [
            "EmergencyExitBlockageDetectionDetailedReport",
          ],
        }),

      // =========================
      // Single PDF Report
      // =========================

      getEmergencyExitBlockageDetectionSingleReportPdf:
        builder.mutation<
          null,
          EmergencyExitBlockageSingleReportRequest
        >({
          query: (body) => ({
            url: `${apiRoutes.emergencyExitBlockageDetection.root}/${apiRoutes.emergencyExitBlockageDetection.getEmergencyExitBlockageDetectionAnalyticsDownloadDetailedReportForSingleId}`,

            method: "POST",

            body,

            responseHandler: async (response) => {
              const blob =
                await response.blob();

              const url =
                globalThis.URL.createObjectURL(
                  blob,
                );

              const a =
                document.createElement("a");

              a.href = url;

              a.download = `emergency-exit-blockage-single-report-${Date.now()}.pdf`;

              document.body.appendChild(a);

              a.click();

              a.remove();

              globalThis.URL.revokeObjectURL(
                url,
              );

              return null;
            },
          }),

          async onQueryStarted(
            arg,
            { dispatch, queryFulfilled },
          ) {
            await rtkAPIToast(
              queryFulfilled,
              dispatch,
              {
                successMessage:
                  "Emergency exit blockage single PDF report downloaded successfully.",

                errorMessage:
                  "Failed to download emergency exit blockage single PDF report.",

                duration: 4000,
              },
            );
          },
        }),

      // =========================
      // CSV Report
      // =========================

      getEmergencyExitBlockageDetectionDetailedCsvReport:
        builder.mutation<
          null,
          EmergencyExitBlockageReportRequest
        >({
          query: (body) => ({
            url: `${apiRoutes.emergencyExitBlockageDetection.root}/${apiRoutes.emergencyExitBlockageDetection.getEmergencyExitBlockageDetectionAnalyticsDownloadDetailedCSVReport}`,

            method: "POST",

            body,

            responseHandler: async (response) => {
              const blob =
                await response.blob();

              const url =
                globalThis.URL.createObjectURL(
                  blob,
                );

              const a =
                document.createElement("a");

              a.href = url;

              a.download = `emergency-exit-blockage-report-${Date.now()}.csv`;

              document.body.appendChild(a);

              a.click();

              a.remove();

              globalThis.URL.revokeObjectURL(
                url,
              );

              return null;
            },
          }),

          async onQueryStarted(
            arg,
            { dispatch, queryFulfilled },
          ) {
            await rtkAPIToast(
              queryFulfilled,
              dispatch,
              {
                successMessage:
                  "Emergency exit blockage detailed CSV report downloaded successfully.",

                errorMessage:
                  "Failed to download emergency exit blockage detailed CSV report.",

                duration: 4000,
              },
            );
          },
        }),

      // =========================
      // Detailed PDF Report
      // =========================

      getEmergencyExitBlockageDetectionDetailedPdfReport:
        builder.mutation<
          null,
          EmergencyExitBlockageReportRequest
        >({
          query: (body) => ({
            url: `${apiRoutes.emergencyExitBlockageDetection.root}/${apiRoutes.emergencyExitBlockageDetection.getEmergencyExitBlockageDetectionAnalyticsDownloadDetailedPdfReport}`,

            method: "POST",

            body,

            responseHandler: async (response) => {
              const blob =
                await response.blob();

              const url =
                globalThis.URL.createObjectURL(
                  blob,
                );

              const a =
                document.createElement("a");

              a.href = url;

              a.download = `emergency-exit-blockage-report-${Date.now()}.pdf`;

              document.body.appendChild(a);

              a.click();

              a.remove();

              globalThis.URL.revokeObjectURL(
                url,
              );

              return null;
            },
          }),

          async onQueryStarted(
            arg,
            { dispatch, queryFulfilled },
          ) {
            await rtkAPIToast(
              queryFulfilled,
              dispatch,
              {
                successMessage:
                  "Emergency exit blockage detailed PDF report downloaded successfully.",

                errorMessage:
                  "Failed to download emergency exit blockage detailed PDF report.",

                duration: 4000,
              },
            );
          },
        }),
              // ---------------------------
              // Shift Timing
              // ---------------------------
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
  useLazyGetEmergencyExitBlockageDetectionDataQuery,

  useLazyGetEmergencyExitBlockageDetectionDetailedReportQuery,

  useGetEmergencyExitBlockageDetectionSingleReportPdfMutation,

  useGetEmergencyExitBlockageDetectionDetailedCsvReportMutation,

  useGetEmergencyExitBlockageDetectionDetailedPdfReportMutation,
  useGetOrgShiftTimeDataQuery
} =
  emergencyExitBlockageDetectionApi;