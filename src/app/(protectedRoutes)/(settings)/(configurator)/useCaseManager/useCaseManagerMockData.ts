import { UseCase, Camera } from "./UseCaseManagerAPI";

export const mockUsecasesResponse: UseCase[] = [
  { id: "uc-ppe", usecaseName: "PPE Compliance Detection", description: "Detects missing helmets, vests, gloves, and masks.", is_threshold: false, labels: ["helmet", "vest", "gloves", "mask"] },
  { id: "uc-fire-smoke", usecaseName: "Fire & Smoke Detection", description: "Detects fire and smoke across monitored zones.", is_threshold: false, labels: ["fire", "smoke"] },
  { id: "uc-fall", usecaseName: "Person Fall Detection", description: "Detects a person falling on the floor.", is_threshold: false, labels: ["fall"] },
  { id: "uc-forklift", usecaseName: "Vehicle in Pedestrian Walkway Detection", description: "Detects forklifts/vehicles entering pedestrian walkways.", is_threshold: false, labels: ["forklift", "vehicle"] },
  { id: "uc-exit-blockage", usecaseName: "Emergency Exit Obstruction Detection", description: "Detects blocked emergency exits.", is_threshold: false, labels: ["exit"] },
  { id: "uc-crowd", usecaseName: "Crowd Detection in Hazardous Areas", description: "Detects crowd gathering in hazardous zones.", is_threshold: true, labels: ["crowd"] },

  { id: "uc-intrusion", usecaseName: "Perimeter Intrusion Detection", description: "Detects unauthorized entry at the premises perimeter.", is_threshold: false, labels: ["intrusion"] },
  { id: "uc-shutdown-movement", usecaseName: "Shutdown Period Activity Detection", description: "Detects movement during shutdown hours.", is_threshold: false, labels: ["movement"] },
  { id: "uc-restricted-access", usecaseName: "Restricted Area Access Detection", description: "Detects unauthorized access to restricted areas.", is_threshold: false, labels: ["access"] },

  { id: "uc-idle-time", usecaseName: "Employee Idle Time Monitoring", description: "Tracks employee idle time on the floor.", is_threshold: true, labels: ["idle"] },
  { id: "uc-presence-critical", usecaseName: "Critical Area Occupancy Monitoring", description: "Monitors occupancy of critical areas.", is_threshold: false, labels: ["presence"] },
  { id: "uc-presence-restricted", usecaseName: "Restricted Area Occupancy Monitoring", description: "Monitors occupancy of restricted areas.", is_threshold: false, labels: ["presence"] },
  { id: "uc-mobile-usage", usecaseName: "Mobile Phone Usage Detection", description: "Detects mobile phone usage in restricted zones.", is_threshold: false, labels: ["mobile"] },
  { id: "uc-guard-sleeping", usecaseName: "Security Guard Alertness Monitoring", description: "Detects sleeping or absent security guards.", is_threshold: false, labels: ["guard"] },

  { id: "uc-vehicle-anpr", usecaseName: "Vehicle Counting & ANPR", description: "Counts vehicles and reads number plates at gates.", is_threshold: false, labels: ["vehicle", "anpr"] },
  { id: "uc-canteen", usecaseName: "Canteen Occupancy Monitoring", description: "Monitors canteen usage and timings.", is_threshold: false, labels: ["canteen"] },
  { id: "uc-vehicle-loading", usecaseName: "Loading & Unloading Activity Monitoring", description: "Tracks vehicle loading/unloading duration.", is_threshold: false, labels: ["loading"] },
  { id: "uc-unauth-parking", usecaseName: "Unauthorized Parking Detection", description: "Detects unauthorized parking blocking aisles.", is_threshold: false, labels: ["parking"] },
];

export const mockCamerasResponse: Camera[] = [
  { id: "cam-1", cameraName: "Main Entrance", cameraIp: "192.168.1.10", RTSPport: 554, cameraZone: "Perimeter", connectionType: "Hikvision", status: "connected" },
  { id: "cam-2", cameraName: "Assembly Line 1", cameraIp: "192.168.1.11", RTSPport: 554, cameraZone: "Manufacturing Floor", connectionType: "Dahua", status: "connected" },
  { id: "cam-3", cameraName: "Loading Dock", cameraIp: "192.168.1.12", RTSPport: 554, cameraZone: "Warehouse", connectionType: "Axis", status: "connected" },
  { id: "cam-4", cameraName: "Main Gate", cameraIp: "192.168.1.13", RTSPport: 554, cameraZone: "Perimeter", connectionType: "Hikvision", status: "connected" },
  { id: "cam-5", cameraName: "Canteen", cameraIp: "192.168.1.14", RTSPport: 554, cameraZone: "Office Block", connectionType: "Dahua", status: "connected" },
];

export const mockAssignmentMap: Record<string, string[]> = {
  "uc-ppe": ["cam-2"],
  "uc-fire-smoke": ["cam-1", "cam-2", "cam-3"],
  "uc-intrusion": ["cam-1", "cam-4"],
  "uc-vehicle-anpr": ["cam-4"],
  "uc-canteen": ["cam-5"],
};
