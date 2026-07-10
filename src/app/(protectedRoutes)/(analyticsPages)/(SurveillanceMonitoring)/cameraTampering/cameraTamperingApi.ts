import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import {
  CameraTamperingReportRequest,
  CameraTamperingResponse,
  CameraTamperingSingleReportRequest,
  ShiftType,
} from "./cameraTampering.types";
import { rtkAPIToast } from "@/utils/rtkAPIToast";

export const cameraTamperingApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
    getCameraTamperingDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.cameraTamperingDetection.root}/${apiRoutes.cameraTamperingDetection.getCameraTamperingDetectionAnalyticsDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["CameraTamperingDetailedReport"],
    }),

    getCameraTamperingData: builder.query<
      CameraTamperingResponse,
      {
        tenantId: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (body) => ({
        url: `${apiRoutes.cameraTamperingDetection.root}/${apiRoutes.cameraTamperingDetection.getCameraTamperingDetectionAnalyticsData}`,
        method: "POST",
        body,
      }),
      providesTags: ["CameraTamperingData"],
    }),

    getCameraTamperingDetailedPdfReport: builder.mutation<
      null,
      CameraTamperingReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.cameraTamperingDetection.root}/${apiRoutes.cameraTamperingDetection.getCameraTamperingDetectionAnalyticsDownloadDetailedPdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `Camera-Tampering-Detailed-Report-${Date.now()}.pdf`;

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
            "Camera Tampering detailed report downloaded successfully.",
          errorMessage:
            "Failed to download Camera Tampering detailed report.",
          duration: 5000,
        });
      },
    }),

    getCameraTamperingDetailedCsvReport: builder.mutation<
      null,
      CameraTamperingReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.cameraTamperingDetection.root}/${apiRoutes.cameraTamperingDetection.getCameraTamperingDetectionAnalyticsDownloadDetailedCSVReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `Camera-Tampering-Report-${Date.now()}.csv`;

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
            "Camera Tampering detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download Camera Tampering detailed CSV report.",
          duration: 4000,
        });
      },
    }),

    getCameraTamperingSingleReportPdf: builder.mutation<
      null,
      CameraTamperingSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.cameraTamperingDetection.root}/${apiRoutes.cameraTamperingDetection.getCameraTamperingDetectionAnalyticsDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `Camera-Tampering-Single-Report-${Date.now()}.pdf`;

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
            "Camera Tampering single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download Camera Tampering single PDF report.",
          duration: 4000,
        });
      },
    }),

    getOrgShiftTimeCameraTamperingData: builder.query<
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
  useGetOrgShiftTimeCameraTamperingDataQuery,
  useLazyGetCameraTamperingDetailedReportQuery,
  useLazyGetCameraTamperingDataQuery,
  useGetCameraTamperingDetailedPdfReportMutation,
  useGetCameraTamperingDetailedCsvReportMutation,
  useGetCameraTamperingSingleReportPdfMutation,
} = cameraTamperingApi;