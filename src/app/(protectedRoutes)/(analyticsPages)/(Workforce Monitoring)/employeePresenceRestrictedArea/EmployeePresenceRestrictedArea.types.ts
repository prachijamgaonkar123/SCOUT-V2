
import { EmployeePresenceRestrictedAreaKpiConfig } from "./EmployeePresenceRestrictedAreaConfig";

/* ---------- KPI ---------- */
export type KpiTitle = keyof typeof EmployeePresenceRestrictedAreaKpiConfig;
export type KpiColour = "red" | "green" | "blue";

export interface EmployeePresenceRestrictedAreaKpiItem {
  title: KpiTitle;
  value: number | string;
  colour: KpiColour;
}

/* ---------- VIOLATIONS ---------- */
export interface EmployeePresenceRestrictedAreaViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}

/* ---------- ZONE VIOLATIONS ---------- */
export interface EmployeePresenceRestrictedAreaZoneViolation {
  zone: string;
  violations: number;
}

/* ---------- DETAILED REPORT ---------- */
export interface EmployeePresenceRestrictedAreaDetailedReportResponse {
  data: EmployeePresenceRestrictedAreaViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}

/* ---------- FILTER PARAMS ---------- */
export interface EmployeePresenceRestrictedAreaFilterParams {
  violation?: string;
  zone?: string;
  camera?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------- SOCKET PAYLOAD ---------- */
export interface EmployeePresenceRestrictedAreaSocketPayload {
  serverTimestamp: string;
  kpi: EmployeePresenceRestrictedAreaKpiItem[];
  zoneViolations: EmployeePresenceRestrictedAreaZoneViolation[];
  recentViolations: EmployeePresenceRestrictedAreaViolation[];
}

/* ---------- API REQUEST TYPES ---------- */
export type EmployeePresenceRestrictedAreaSingleReportRequest = {
  tenantId: string;
  violation?: string;
  zone?: string;
  camera?: string;
  imageUrl?: string;
  time?: string;
  alarmTriggered?: boolean;
};

export type EmployeePresenceRestrictedAreaReportRequest = {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  violation?: string;
  zone?: string;
  camera?: string;
};

/* ---------- OVERVIEW RESPONSE ---------- */
export type EmployeePresenceRestrictedAreaResponse = {
  kpi: EmployeePresenceRestrictedAreaKpiItem[];
  zoneViolations: EmployeePresenceRestrictedAreaZoneViolation[];
  recentViolations: EmployeePresenceRestrictedAreaViolation[];
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