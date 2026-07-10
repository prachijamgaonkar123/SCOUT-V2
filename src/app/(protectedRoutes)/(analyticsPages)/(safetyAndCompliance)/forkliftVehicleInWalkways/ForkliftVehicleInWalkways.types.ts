import { ForklifVehicleInWalkwaysKpiConfig } from "./ForkliftVehicleInWalkways.config";


/* ---------- KPI ---------- */
export type KpiTitle = keyof typeof ForklifVehicleInWalkwaysKpiConfig;
export type KpiColour = "red" | "green" | "blue";

export interface ForklifVehicleInWalkwaysKpiItem {
  title: KpiTitle;
  value: number | string;
  color: KpiColour;
}

/* ---------- VIOLATIONS ---------- */
export interface ForklifVehicleInWalkwaysRecentViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}

/* ---------- ZONE VIOLATIONS ---------- */
export interface ForklifVehicleInWalkwaysZoneViolation {
  zone: string;
   violations: number;
   subViolations: {
    label: string;
    value: number;
  }[];
}

/* ---------- DETAILED REPORT ---------- */
export interface forkliftVehicleInWalkwaysDetailedReportResponse {
  data: ForklifVehicleInWalkwaysRecentViolation[];
  zones: string[];
  objectNames:string[];
  walkways:string[];
  cameras: string[];
  total: number;
}

/* ---------- FILTER PARAMS ---------- */
export interface ForklifVehicleInWalkwaysFilterParams {
  violation?: string;
  zone?: string;
  objectName?:string;
    walkway?:string;

  camera?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------- SOCKET PAYLOAD ---------- */
export interface ForklifVehicleInWalkwaysSocketPayload {
  serverTimestamp: string;
  kpi: ForklifVehicleInWalkwaysKpiItem[];
  zoneViolations: ForklifVehicleInWalkwaysZoneViolation[];
  recentViolations:ForklifVehicleInWalkwaysRecentViolation[];
}

/* ---------- API REQUEST TYPES ---------- */
export type  ForklifVehicleInWalkwaysSingleReportRequest = {
  tenantId: string;
  violation?: string;
  walkway?:string;
  zone?: string;
  camera?: string;
  imageUrl?: string;
  time?: string;
  alarmTriggered?: boolean;
};

export type ForklifVehicleInWalkwaysReportRequest = {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  violation?: string;
  zone?: string;
  camera?: string;
};

/* ---------- OVERVIEW RESPONSE ---------- */
export type  ForklifVehicleInWalkwaysResponse = {
  kpi:  ForklifVehicleInWalkwaysKpiItem[];
  zoneViolations: ForklifVehicleInWalkwaysZoneViolation[];
  recentViolations:  ForklifVehicleInWalkwaysRecentViolation[];
};

/* ---------- SHIFTS ---------- */
export interface ShiftType {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  status: string;
}