import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";

/* ---------- TYPES ---------- */

export type AddCameraPayload = {
  cameraName: string;
  cameraIp: string;
  userName: string;
  password: string;
  RTSPport: string | number;
  cameraZone?: string;
  cameraLocation?: string;
  channel?: string;
  connectionType: "DIRECT_TO_CAMERA" | "NVR";
  refreshRate?: number;
};

export type DetectNvrChannelsPayload = {
  nvrName: string;
  brandName: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  numberofchannels: number;
  rtsplink?: string;
};

export type DetectNvrChannelsResponse = {
  activeChannels?: number[];
  noResponseChannels?: number[];
};
type DetectedNvrChannel = {
  channel: number;
  rtspUrl: string;
};

/* ---------- API ---------- */

export const cameraManagementApi = baseProtectedApi.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({

    /* ---------- GET CAMERAS ---------- */
    getAllCameras: builder.query<
      { status: string; message: string; data?: string[]; error?: string },
      void
    >({
      query: () => ({
        url: `${apiRoutes.configurator.root}/camera-manager`,
        method: "GET",
      }),
      providesTags: ["CameraManagement"],
    }),

    /* ---------- GET ZONES ---------- */
    getCameraZones: builder.query<
      { status: string; message: string; data?: string[]; error?: string },
      void
    >({
      query: () => ({
        url: `${apiRoutes.configurator.root}/camera-manager/zones`,
        method: "GET",
      }),
      providesTags: ["CameraManagement"],
    }),


    /* ---------- GET LOCATIONS BY ZONE ---------- */
    getLocationsByZone: builder.query<
      { status: string; message: string; data?: string; error?: string },
      string
    >({
      query: (zoneId) => ({
        url: `${apiRoutes.configurator.root}/camera-manager/locations/${zoneId}`,
        method: "GET",
      }),
      providesTags: ["CameraManagement"],
    }),

    /* ---------- ADD CAMERA ---------- */
    addCamera: builder.mutation({
      query: (body) => ({
        url: `${apiRoutes.configurator.root}/camera-manager`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CameraManagement"],
    }),


    /* ---------- DELETE CAMERA ---------- */
    deleteCamera: builder.mutation<
      { status: string; message: string; data?: string; error?: string },
      string
    >({
      query: (cameraId) => ({
        url: `${apiRoutes.configurator.root}/camera-manager/${cameraId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CameraManagement"],
    }),

    /* ---------- DETECT NVR CHANNELS ---------- */


    detectNvrChannels: builder.mutation<
      {
        data: string;
        activeChannels: DetectedNvrChannel[];
        noResponseChannels?: number[];
      },
      DetectNvrChannelsPayload
    >({

      query: (body) => ({
        url: `${apiRoutes.configurator.root}/camera-manager/detect-nvr-channels`,
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        activeChannels?: { channel: number; rtspUrl: string }[];
        noResponseChannels?: number[];
      }) => ({
        data: "success",
        activeChannels: response.activeChannels ?? [],
        noResponseChannels: response.noResponseChannels ?? [],
      }),

    }),


//     getCameraFrame: builder.query<Blob, {
//   tenantId: string;
//   cameraId: string;
// }>({
//   query: ({ tenantId, cameraId }) => ({
//     url: `${apiRoutes.configurator.root}/camera-manager/${tenantId}/${cameraId}/frame`,
//     method: 'GET',
//     responseHandler: async (response) => response.blob(),
//   }),
// }),


  }),
});

/* ---------- HOOK EXPORTS ---------- */

export const {
  useGetAllCamerasQuery,
  useGetCameraZonesQuery,
  useGetLocationsByZoneQuery,
  useLazyGetLocationsByZoneQuery,
  useAddCameraMutation,
  useDeleteCameraMutation,
  useDetectNvrChannelsMutation,
  // useLazyGetCameraFrameQuery,
} = cameraManagementApi;
