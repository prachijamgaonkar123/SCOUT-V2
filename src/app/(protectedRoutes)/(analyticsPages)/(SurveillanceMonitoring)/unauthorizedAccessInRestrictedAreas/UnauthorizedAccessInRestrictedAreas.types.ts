import { UnauthorizedAccessConfig } from "./UnauhtorizedAccessInRestrictedAreaConfig";

export interface ShiftType {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  status: string;
}
export type KpiTitle = keyof typeof UnauthorizedAccessConfig;

export type KpiColour = "red" | "green" | "blue";
export interface UnauthorizedAccessInRestrictedAreasKpiItem {
  title: keyof typeof UnauthorizedAccessConfig;
  value: number | string;
  colour: KpiColour;
}
export interface UnauthorizedAccessInRestrictedAreasZoneViolation {
  zone: string;
  violations: number;
  subViolations: {
    label: string;
    value: number;
  }[];
}
export type UnauthorizedAccessResponse = {
  kpi: UnauthorizedAccessInRestrictedAreasKpiItem[];
  zoneViolations: UnauthorizedAccessInRestrictedAreasZoneViolation[];
  recentViolations: UnauthorizedAccessInRestrictedAreasViolation[];
};

export interface UnauthorizedAccessInRestrictedAreasFilterParams {
  zone?: string;
  cameraName?: string;
  startDate?: string;
  endDate?: string;

  alarmTriggered?: string;
}


export interface UnauthorizedAccessInRestrictedAreasDetailedReportResponse {
  data: UnauthorizedAccessInRestrictedAreasViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}
export interface UnauthorizedAccessInRestrictedAreasViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  alarmTriggered: string;
  [key: string]: string | number | boolean;
}

export type UnauthorizedAccessInRestrictedAreasSingleReportRequest = {
  tenantId: string;
  violation?: string;
  zone?: string;
  alarmTriggered?: string;
  camera?: string;
  imageUrl?: string;
  time?: string;
};
export type UnauthorizedAccessInRestrictedAreasReportRequest = {
  tenantId: string;
  startDate: string;
  endDate: string;
  violation?: string;
  zone?: string;
  camera?: string;
};
export interface UnauthorizedAccessInRestrictedAreasSocketPayload {
  serverTimestamp: string;
  kpi: UnauthorizedAccessInRestrictedAreasKpiItem[];
  zoneViolations: UnauthorizedAccessInRestrictedAreasZoneViolation[];
  recentViolations: UnauthorizedAccessInRestrictedAreasViolation[];
}