import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { ROIShape } from "@/app/types/roi";

/* ---------- TYPES ---------- */

export type SaveRoiPayload = {
    cameraId: string;
    usecaseId: string;
    modelThreshold?: number;
    rois: {
        type: ROIShape["type"];
        labels: string[];
        mode: ROIShape["mode"];
        points: ROIShape["points"];
    }[];
};


export type GetRoiParams = {
    cameraId: string;
    usecaseId: string;
};


export type RoiResponse = {
  roiCordinates?: {
    rois: {
      id?: string;
      type: ROIShape["type"];
      labels: string[];
      mode: ROIShape["mode"];
      color?: string;
      points: ROIShape["points"];
    }[];
  };
  modelThreshold?: number;
};


/* ---------- API ---------- */

export const roiApi = baseProtectedApi.injectEndpoints({
    endpoints: (builder) => ({

        /* ---------- GET ROI ---------- */
        getRoi: builder.query<
  { rois: ROIShape[]; modelThreshold?: number },
  GetRoiParams
>({
  query: ({ cameraId, usecaseId }) => ({
    url: `/configurator/camera-roi/${cameraId}/${usecaseId}`,
    method: "GET",
  }),
  transformResponse: (response: RoiResponse) => ({
    modelThreshold: response.modelThreshold,
    rois: (response.roiCordinates?.rois ?? []).map((r, index) => ({
      id: r.id || `roi-${index}`,
      type: r.type,
      labels: r.labels,
      mode: r.mode,
      points: r.points,
      completed: true,
      color: r.color ?? "#00ff00",
    })),
  }),
}),



        /* ---------- SAVE ROI ---------- */
        saveRoi: builder.mutation<RoiResponse, SaveRoiPayload>({
            query: ({ cameraId, usecaseId, rois, modelThreshold }) => ({
                url: `/configurator/camera-roi`,
                method: "POST",
                body: {
                    cameraId,
                    usecaseId,
                    rois,
                    modelThreshold, // ✅ ADD
                },
            }),
        }),



        /* ---------- UPDATE ROI ---------- */
        updateRoi: builder.mutation<RoiResponse, SaveRoiPayload>({
            query: ({ cameraId, usecaseId, rois }) => ({
                url: `/configurator/camera-roi/${cameraId}/${usecaseId}`,
                method: "PUT",
                body: { rois },
            }),
        }),



        /* ---------- DELETE ROI ---------- */
        deleteRoi: builder.mutation<RoiResponse, GetRoiParams>({
            query: ({ cameraId, usecaseId }) => ({
                url: `/configurator/camera-roi/${cameraId}/${usecaseId}`,
                method: "DELETE",
            }),
        }),


    }),
});

/* ---------- HOOK EXPORTS ---------- */

export const {
    useGetRoiQuery,
    useLazyGetRoiQuery,
    useSaveRoiMutation,
    useUpdateRoiMutation,
    useDeleteRoiMutation,
} = roiApi;