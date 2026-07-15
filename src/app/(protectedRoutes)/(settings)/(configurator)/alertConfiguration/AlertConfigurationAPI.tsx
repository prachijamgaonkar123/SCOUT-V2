import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { apiRoutes } from "@/constants/apiRoutes";
import { UserAlertConfig, UserUseCaseAlertSetting } from "@/app/types/alertConfig";

/* ---------- TYPES ---------- */

export type AlertUserStatusRecord = {
  id: string;
  userId: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SaveUserSubscriptionsPayload = {
  userId: string;
  subscriptions: UserUseCaseAlertSetting[];
};

export type SetUserStatusPayload = {
  userId: string;
  enabled: boolean;
};

/* ---------- API ---------- */

export const alertConfigurationApi = baseProtectedApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ---------- GET ALL USER SUBSCRIPTIONS (grouped by user) ---------- */
    getUserSubscriptions: builder.query<UserAlertConfig[], void>({
      query: () => ({
        url: `${apiRoutes.configurator.root}${apiRoutes.configurator.alertConfig}/subscriptions`,
        method: "GET",
      }),
      providesTags: [{ type: "AlertConfig", id: "subscriptions" }],
    }),

    /* ---------- REPLACE A USER'S SUBSCRIPTIONS ---------- */
    saveUserSubscriptions: builder.mutation<UserAlertConfig, SaveUserSubscriptionsPayload>({
      query: ({ userId, subscriptions }) => ({
        url: `${apiRoutes.configurator.root}${apiRoutes.configurator.alertConfig}/subscriptions/${userId}`,
        method: "PUT",
        body: { subscriptions },
      }),
      invalidatesTags: [{ type: "AlertConfig", id: "subscriptions" }],
    }),

    /* ---------- GET ALL USER ENABLE/DISABLE STATUSES ---------- */
    getUserStatuses: builder.query<AlertUserStatusRecord[], void>({
      query: () => ({
        url: `${apiRoutes.configurator.root}${apiRoutes.configurator.alertConfig}/user-status`,
        method: "GET",
      }),
      providesTags: [{ type: "AlertConfig", id: "user-status" }],
    }),

    /* ---------- SET A USER'S ENABLE/DISABLE STATUS ---------- */
    setUserStatus: builder.mutation<AlertUserStatusRecord, SetUserStatusPayload>({
      query: (body) => ({
        url: `${apiRoutes.configurator.root}${apiRoutes.configurator.alertConfig}/user-status`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AlertConfig", id: "user-status" }],
    }),

  }),
});

/* ---------- HOOK EXPORTS ---------- */

export const {
  useGetUserSubscriptionsQuery,
  useSaveUserSubscriptionsMutation,
  useGetUserStatusesQuery,
  useSetUserStatusMutation,
} = alertConfigurationApi;
