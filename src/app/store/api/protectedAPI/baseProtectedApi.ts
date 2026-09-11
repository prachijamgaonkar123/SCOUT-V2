import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store/store";

export const baseProtectedApi = createApi({
  reducerPath: "protectedApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4001/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;

      // Get tenant ID from auth state (from Redux)
      const tenantId = state.auth?.user?.org_id;

      if (tenantId) {
        headers.set("x-tenant-id", tenantId);
      } else {
        console.warn(
          "⚠️ No tenant ID found in auth state. User might not be logged in.",
        );
      }

      // Get JWT token from localStorage
      const token = localStorage.getItem("scout_access_token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      } else {
        console.warn(
          "⚠️ No JWT token found in localStorage. User might not be logged in.",
        );
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [
    "PPEKpi",
    "PpeZoneViolations",
    "PpeRecentViolations",
    "PpeDetailedReport",
    "PpeReportCsv",
    "CreateRole",
    "EditRole",
    "AssignFeatureToRole",
    "RoleOverview",
    "UserRoleInformation",
    "ViewRole",
    "AddFeatures",
    "RoleDetails",
    "AddUser",
    "UserOverview",
    "ViewUser",
    "EditUser",
    "CameraManagement",
    "ZoneLocationManagement",
    "UseCaseManager",
    "ROI",
    "UserList",
    "IntrusionKpi",
    "IntrusionZoneViolations",
    "IntrusionRecentViolations",
    "IntrusionDetailedReport",
    "IntrusionReportPdf",
    "EmployeeIdleTimeKpi",
    "EmployeeIdleTimeZoneViolations",
    "EmployeeIdleTimeDetailedReport",
    "EmployeeIdleTimeRecentViolations",
    "SurveillanceMonitoringDashboardKpi",
    "WorkforceMonitoringDashboardKpi",
    "MainDashboardKpi",
    "MovementDuringShutdownHoursKpi",
    "MovementDuringShutdownHoursZoneViolations",
    "MovementDuringShutdownHoursRecentViolations",
    "MovementDuringShutdownHoursDetailedReport",
    "OrgLogo",
    "orgShiftTime",
    "CameraTamperingDashboardKpi",

    "FireSmokeDetectionKpi",
    "FireSmokeDetectionZoneViolations",
    "FireSmokeDetectionDetailedReport",
    "FireSmokeDetectionRecentViolations",
    "SafetyAndComplianceDashboardKpi",
    "FallLaydownDetectionKpi",
    "FallLaydownDetectionZoneViolations",
    "FallLaydownDetectionDetailedReport",
    "FallLaydownDetectionRecentViolations",
    "UnauthorizedAccessData",
    "UnauthorizedAccessDetailedReport",
    "EmployeePresenceCriticalAreaData",
    "EmployeePresenceCriticalAreaDetailedReport",
    "EmployeePresenceRestrictedAreaDetailedReport",
    "EmployeePresenceRestrictedAreaData",
    "PeopleCountData",
    "PeopleCountDetailedReport",
    "OperationalDashboardData",
    "CrowdGatheringAnalytics",
    "CrowdGatheringDetailedReport",
    "ForkliftVehicleInWalkwaysDetailedReport",
    "ForkliftVehicleInWalkwaysAnalytics",
    "EmergencyExitBlockageDetectionAnalytics",
    "EmergencyExitBlockageDetectionDetailedReport",
    "CameraTamperingDetailedReport",
    "CameraTamperingData",
    "FireSmokeDetectionData" ,
    "CanteenUsageData",
    "CanteenUsageDetailedReport",
    "AlertConfig",
    "ZoneOccupancyMonitoringAnalytics",
    "ZoneOccupancyMonitoringDetailedReport",

],
});
