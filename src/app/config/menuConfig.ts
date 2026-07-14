import { PageType } from "../types";
import {
  Shield,
  Visibility,
  People,
  Settings,
  VideoCall,
  Warning,
  DirectionsCar,
} from "@mui/icons-material";
import FaceRecognitionIcon from "@mui/icons-material/CenterFocusWeak";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PeopleIcon from "@mui/icons-material/People";
import TuneIcon from "@mui/icons-material/Tune";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";

import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material/SvgIcon";
import { FEATURE } from "./featureRegistry";

/* =========================
   TYPES
========================= */

interface BaseMenuItem {
  name: string;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">>;
  page?: PageType;
  featureId?: string; // permission-based
  featureFlag?: boolean; // frontend on/off
}

export interface LinkMenuItem extends BaseMenuItem {
  type: "link";
  path: string;
  badge?: string;
}

export interface GroupMenuItem extends BaseMenuItem {
  type: "group";
  items: MenuItemConfig[];
  path?: string;
}

export type MenuItemConfig = LinkMenuItem | GroupMenuItem;

export interface CategoryConfig {
  title: string;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">>;
  items: MenuItemConfig[];
  featureId?: string;
  path?: string;
}

/* =========================
   LIVE STREAMING
========================= */

// export const liveStreamingMenu: MenuItemConfig[] = [
//   {
//     type: "link",
//     name: "Live Streaming",
//     icon: VideoCall,
//     page: "live-streaming",
//     path: "/liveStreamingPage-new",
//     featureId: FEATURE.LIVE_STREAMING,
//     featureFlag: true,
//   },
// ];

/* =========================
   DASHBOARD
========================= */

export const dashboardMenu: CategoryConfig[] = [
  {
    title: "Dashboard",
    icon: SpaceDashboardIcon,
    path: "/dashboard",
    items: [
      {
        type: "link",
        name: "Safety And Compliance",
        page: "safety-compliance-dashboard",
        path: "/safetyAndComplianceDashboard",
        featureId: FEATURE.SAFETY_COMPLIANCE,
      },
      {
        type: "link",
        name: "Surveillance Monitoring",
        page: "surveillance-monitoring-dashboard",
        path: "/surveillanceMonitoringDashboard",
        featureId: FEATURE.SURVEILLANCE_MONITORING,
      },
      {
        type: "link",
        name: "Workforce Monitoring",
        page: "workforce-monitoring-dashboard",
        path: "/workforceMonitoringDashboard",
        featureId: FEATURE.WORKFORCE_MONITORING,
      },
      {
        type: "link",
        name: "Operational Insights",
        page: "operational-insights-dashboard",
        path: "/operationalInsightsDashboard",
        featureId: FEATURE.OPERATIONAL_INSIGHTS,
      },

      {
        type: "link",
        name: "Camera Tampering",
        page: "workforce-monitoring-dashboard",
        path: "/cameraTamperingDashboard",
        featureId: FEATURE.CAMERA_TAMPERING,
      },
    ],
  },
];

/* =========================
   ALERTS
========================= */

export const alertMenu: MenuItemConfig[] = [
  {
    type: "link",
    name: "Alerts",
    icon: Warning,
    badge: "12",
    page: "alerts",
    path: "/alertsPage",
    featureId: FEATURE.ALERTS,
  },
];

/* =========================
   SETTINGS
========================= */

export const settingsMenu: CategoryConfig[] = [
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        type: "link",
        name: "Role Management",
        icon: ManageAccountsIcon,
        path: "/roleOverview",
        featureId: FEATURE.ROLE_MANAGEMENT,
      },
      {
        type: "link",
        name: "User Management",
        icon: PeopleIcon,
        path: "/userOverview",
        featureId: FEATURE.USER_MANAGEMENT,
      },
      {
        type: "group",
        name: "configurator",
        icon: TuneIcon,
        featureFlag: true,
        items: [
          {
            type: "link",
            name: "Zone-Location Mapping",
            path: "/zoneLocationMapping",
            featureId: FEATURE.ZONE_LOCATION_MAPPING,
          },
          {
            type: "link",
            name: "Camera Management",
            path: "/cameraManagement",
            featureId: FEATURE.CAMERA_MANAGEMENT,
          },
          {
            type: "link",
            name: "Use-Case Manager",
            path: "/useCaseManager",
            featureId: FEATURE.USE_CASE_MANAGER,
          },

          {
            type: "link",
            name: "Alert Configuration",
            // icon: NotificationsActiveIcon,
            path: "/alertConfiguration",
            featureId: FEATURE.ALERT_CONFIGURATION,
          },
        ],
      },
    ],
  },
];

/* =========================
   ANALYTICS
========================= */

// export const analyticsMenu: CategoryConfig[] = [
 
//   {
//     title: "Safety and Compliance",
//     icon: Shield,
//     items: [
//       {
//         type: "link",
//         name: "PPE Detection",
//         path: "/ppeKitDetectionPage",
//         featureId: FEATURE.PPE_DETECTION,
//       },
//       {
//         type: "link",
//         name: "Fire & Smoke Detection",
//         path: "/fireSmokeDetection",
//         featureId: FEATURE.FIRE_SMOKE,
//       },
//       {
//         type: "link",
//         name: "Fall Detection",
//         path: "/fallDetection",
//         featureId: FEATURE.FALL_DETECTION,
//       },
//       {
//         type: "link",
//         name: "Forklift/Vehicle In Walkways",
//         path: "/forkliftVehicleInWalkways",
//         featureId: FEATURE.OBJECT_DETECTION,
//       },
//       {
//         type: "link",
//         name: "Emergency Exit Blockage Detection",
//         path: "/emergencyExitBlockage",
//         featureId: FEATURE.EMERGENCY_EXIT_BLOCKAGE,
//       },
//       {
//         type: "link",
//         name: "Crowd Detection In Hazardous Zones",
//         path: "/crowdGathering",
//         featureId: FEATURE.CROWD_DETECTION,
//       },
//     ],
//   },
//   {
//     title: "Surveillance Monitoring",
//     icon: Visibility,
//     items: [
//       {
//         type: "link",
//         name: "Intrusion Detection",
//         path: "/intrusionDetectionPage",
//         featureId: FEATURE.INTRUSION_DETECTION,
//       },
//       {
//         type: "link",
//         name: "Movement During Shutdown Hours",
//         path: "/movementDuringShutdownHours",
//         featureId: FEATURE.MOVEMENT_DURING_SHUTDOWN_HOUR,
//       },
//       {
//         type: "link",
//         name: "Unauthorized Access In Restricted Areas",
//         path: "/unauthorizedAccessInRestrictedAreas",
//         featureId: FEATURE.UNAUTHORIZED_ACCESS,
//       },
//           {
//         type: "link",
//         name: "Camera Tampering Detection",
//         path: "/cameraTampering",
//         featureId: FEATURE.CAMERA_TAMPERING,
//       },
//     ],
//   },
//   {
//     title: "Workforce Monitoring",
//     icon: People,
//     items: [
//       {
//         type: "link",
//         name: "Employee Idle Time Monitoring",
//         path: "/employeeIdleTime",
//         featureId: FEATURE.EMPLOYEE_IDLE_TIME,
//       },
//       {
//         type: "link",
//         name: "Employee Presence In Critical Areas",
//         path: "/employeePresenceCriticalArea",
//         featureId: FEATURE.EMPLOYEE_PRESENCE_CRITICAL_AREA,
//       },
//       {
//         type: "link",
//         name: "Employee Presence In Restricted Areas",
//         path: "/employeePresenceRestrictedArea",
//         featureId: FEATURE.EMPLOYEE_PRESENCE_RESTRICTED_AREA,
//       },

//       {
//         type: "link",
//         name: "Mobile Phone Usage In Restricted Zones",
//         path: "/mobilePhoneUsage",
//         featureId: FEATURE.MOBILE_PHONE_USAGE,
//       },
//       {
//         type: "link",
//         name: "Sleeping / Absence Of Security Guards",
//         path: "/sleepingSecurityPersonnel",
//         featureId: FEATURE.SLEEPING_SECURITY_PERSONNEL,
//       },
//     ],
//   },
//   {
//     title: "Operational Insight",
//     icon: DirectionsCar,
//     items: [
//       {
//         type: "link",
//         name: "People Count In Factory Premises ",
//         path: "/peopleCountPage",
//         featureId: FEATURE.PEOPLE_COUNT,
//       },
//       {
//         type: "link",
//         name: "Vehicle Count & ANPR At Gates",
//         path: "/vehicleCount",
//         featureId: FEATURE.VEHICLE_COUNT,
//       },
//       {
//         type: "link",
//         name: "Canteen Usage Monitoring",
//         path: "/monitoringCanteenUsage&Timings",
//         featureId: FEATURE.CANTEEN_USAGE,
//       },
//       {
//         type: "link",
//         name: "Vehicle Unloading / Loading Monitoring",
//         path: "/vehicleUnloadingLoading",
//         featureId: FEATURE.VEHICLE_UNLOADING_LOADING,
//       },
//       {
//         type: "link",
//         name: "Unauthorized Parking / Blocking Aisles",
//         path: "/unauthorizedParkingOrEquipmentBlockingAisles",
//         featureId: FEATURE.UNAUTHORIZED_PARKING,
//       },
//     ],
//   },
//   {
//     title: "Facial Recognition Analytics",
//     icon: FaceRecognitionIcon,
//     items: [
//       {
//         type: "link",
//         name: "Face Recognition for Entry/Exit Logging",
//         path: "/faceRecognition",
//         featureId: FEATURE.FACE_RECOGNITION,
//       },
//       {
//         type: "link",
//         name: "Employee Idle Time Monitoring with Face Recognition",
//         path: "/employeeIdleTimeMonitoringWithFaceRecognition",
//         featureId: FEATURE.FACE_IDLE_MONITORING,
//       },
//     ],
//   },
// ];

export const analyticsMenu: CategoryConfig[] = [
  {
    title: "Safety & Compliance",
    icon: Shield,
    items: [
      {
        type: "link",
        name: "PPE Detection (Helmet, Vest,Glasses)",
        path: "/ppeKitDetectionPage",
        featureId: FEATURE.PPE_DETECTION,
      },
      {
        type: "link",
        name: "Fire and Smoke Detection",
        path: "/fireSmokeDetection",
        featureId: FEATURE.FIRE_SMOKE,
      },
      {
        type: "link",
        name: "Fall Detection",
        path: "/fallDetection",
        featureId: FEATURE.FALL_DETECTION,
      },
      {
        type: "link",
        name: "Forklift / Vehicle in Walkways",
        path: "/forkliftVehicleInWalkways",
        featureId: FEATURE.OBJECT_DETECTION,
      },
      {
        type: "link",
        name: "Emergency Exit Blockage Detection",
        path: "/emergencyExitBlockage",
        featureId: FEATURE.EMERGENCY_EXIT_BLOCKAGE,
      },
      {
        type: "link",
        name: "Crowd Detection in Hazardous Zones",
        path: "/crowdGathering",
        featureId: FEATURE.CROWD_DETECTION,
      },
    ],
  },
  {
    title: "Surveillance Monitoring",
    icon: Visibility,
    items: [
      {
        type: "link",
        name: "Intrusion Detection at Perimeter",
        path: "/intrusionDetectionPage",
        featureId: FEATURE.INTRUSION_DETECTION,
      },
      {
        type: "link",
        name: "Movement During Shutdown Hours",
        path: "/movementDuringShutdownHours",
        featureId: FEATURE.MOVEMENT_DURING_SHUTDOWN_HOUR,
      },
      // {
      //   type: "link",
      //   name: "Unauthorized Access in Restricted Areas",
      //   path: "/unauthorizedAccessInRestrictedAreas",
      //   featureId: FEATURE.UNAUTHORIZED_ACCESS,
      // },
      {
        type: "link",
        name: "Camera Tampering Detection",
        path: "/cameraTampering",
        featureId: FEATURE.CAMERA_TAMPERING,
      },
    ],
  },
  {
    title: "Workforce Monitoring",
    icon: People,
    items: [
      {
        type: "link",
        name: "Employee Idle Time Monitoring",
        path: "/employeeIdleTime",
        featureId: FEATURE.EMPLOYEE_IDLE_TIME,
      },
      {
        type: "link",
        name: "Employee Presence in Critical Areas",
        path: "/employeePresenceCriticalArea",
        featureId: FEATURE.EMPLOYEE_PRESENCE_CRITICAL_AREA,
      },
      {
        type: "link",
        name: "Employee Presence in Restricted Areas",
        path: "/employeePresenceRestrictedArea",
        featureId: FEATURE.EMPLOYEE_PRESENCE_RESTRICTED_AREA,
      },
      {
        type: "link",
        name: "Mobile Phone Usage in Restricted Zones",
        path: "/mobilePhoneUsage",
        featureId: FEATURE.MOBILE_PHONE_USAGE,
      },
      {
        type: "link",
        name: "Sleeping / Absence of Security Guards",
        path: "/sleepingSecurityPersonnel",
        featureId: FEATURE.SLEEPING_SECURITY_PERSONNEL,
      },
    ],
  },
  {
    title: "Operational Insight",
    icon: DirectionsCar,
    items: [
      {
        type: "link",
        name: "People Count in Factory Premises",
        path: "/peopleCountPage",
        featureId: FEATURE.PEOPLE_COUNT,
      },
      {
        type: "link",
        name: "Vehicle Count & ANPR at Gates",
        path: "/vehicleCount",
        featureId: FEATURE.VEHICLE_COUNT,
      },
      {
        type: "link",
        name: "Canteen Usage Monitoring",
        path: "/monitoringCanteenUsage&Timings",
        featureId: FEATURE.CANTEEN_USAGE,
      },
      {
        type: "link",
        name: "Vehicle Unloading / Loading Monitoring",
        path: "/vehicleUnloadingLoading",
        featureId: FEATURE.VEHICLE_UNLOADING_LOADING,
      },
      {
        type: "link",
        name: "Unauthorized Parking / Blocking Aisles",
        path: "/unauthorizedParkingOrEquipmentBlockingAisles",
        featureId: FEATURE.UNAUTHORIZED_PARKING,
      },
    ],
  },
  {
    title: "Facial Recognition Analytics",
    icon: FaceRecognitionIcon,
    items: [
      {
        type: "link",
        name: "Face Recognition for Entry/Exit Logging",
        path: "/faceRecognition",
        featureId: FEATURE.FACE_RECOGNITION,
      },
      {
        type: "link",
        name: "Employee Idle Time Monitoring with Face Recognition",
        path: "/employeeIdleTimeMonitoringWithFaceRecognition",
        featureId: FEATURE.FACE_IDLE_MONITORING,
      },
    ],
  },
];
/* =========================
   EXPORT
========================= */

export const menuConfig = {
  // liveStreamingMenu,
  dashboardMenu,
  alertMenu,
  analyticsMenu,
  settingsMenu,
};
