import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { rtkAPIToast } from "@/utils/rtkAPIToast";
import { PeopleCountReportRequest, PeopleCountSingleReportRequest, ShiftType } from "./PeopleCount.types";


export const peopleCountApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // ---------------------------
    // KPI + Zone + Recent
    // ---------------------------
    getPeopleCountData: builder.query({
      query: (body) => ({
        url: `${apiRoutes.peopleCountInFactoryPremises.root}/${apiRoutes.peopleCountInFactoryPremises.getPeopleCountInFactoryPremisesKpiZoneRecentViolation}`,
        method: "POST",
        body,
      }),
      providesTags: ["PeopleCountData"],
    }),

    // ---------------------------
    // Detailed Report
    // ---------------------------
    getPeopleCountDetailedReport: builder.query({
      query: (body) => ({
        url: `${apiRoutes.peopleCountInFactoryPremises.root}/${apiRoutes.peopleCountInFactoryPremises.getPeopleCountInFactoryPremisesDetailedReport}`,
        method: "POST",
        body,
      }),
      providesTags: ["PeopleCountDetailedReport"],
    }),

    
    // ---------------------------
    // Single PDF Report
    // ---------------------------
    getPeopleCountSingleReportPdf: builder.mutation<
      null,
      PeopleCountSingleReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.peopleCountInFactoryPremises.root}/${apiRoutes.peopleCountInFactoryPremises.getPeopleCountInFactoryPremisesDownloadDetailedReportForSingleId}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `people-count-single-report-${Date.now()}.pdf`;

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
            "People count single PDF report downloaded successfully.",
          errorMessage:
            "Failed to download people count single PDF report.",
          duration: 4000,
        });
      },
    }),

    // ---------------------------
    // CSV Report
    // ---------------------------
    getPeopleCountDetailedCsvReport: builder.mutation<
      null,
      PeopleCountReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.peopleCountInFactoryPremises.root}/${apiRoutes.peopleCountInFactoryPremises.getPeopleCountInFactoryPremisesDownloadDetailedcsvReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `people-count-report-${Date.now()}.csv`;

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
            "People count detailed CSV report downloaded successfully.",
          errorMessage:
            "Failed to download people count detailed CSV report.",
          duration: 4000,
        });
      },
    }),

    // ---------------------------
    // Detailed PDF Report
    // ---------------------------
    getPeopleCountDetailedPdfReport: builder.mutation<
      null,
      PeopleCountReportRequest
    >({
      query: (body) => ({
        url: `${apiRoutes.peopleCountInFactoryPremises.root}/${apiRoutes.peopleCountInFactoryPremises.getPeopleCountInFactoryPremisesDownloadDetailedPdfReport}`,
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `people-count-report-${Date.now()}.pdf`;

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
            "People count detailed PDF report downloaded successfully.",
          errorMessage:
            "Failed to download people count detailed PDF report.",
          duration: 4000,
        });
      },
    }),
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
  useLazyGetPeopleCountDataQuery,
  useLazyGetPeopleCountDetailedReportQuery,
  useGetPeopleCountSingleReportPdfMutation,
  useGetPeopleCountDetailedCsvReportMutation,
  useGetPeopleCountDetailedPdfReportMutation,
} = peopleCountApi;