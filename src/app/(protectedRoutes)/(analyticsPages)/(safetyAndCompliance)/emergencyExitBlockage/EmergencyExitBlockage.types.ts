import { ExitKpiConfig } from "./EmergencyExitBlockageConfig";

/* ---------- KPI ---------- */

export type KpiTitle =
  keyof typeof ExitKpiConfig;

export type KpiColour =
  | "red"
  | "green"
  | "blue";

export interface EmergencyExitBlockageKpiItem {
  title: KpiTitle;

  value: number | string;

  color: KpiColour;
}

/* ---------- RECENT VIOLATIONS ---------- */

export interface EmergencyExitBlockageRecentViolation {
  violation: string;

  emergencyExitRoute: string;

  zone: string;

  time: string;

  imageUrl: string;

  camera: string;

  alarmTriggered: boolean;

  [key: string]: string | number | boolean;
}

/* ---------- ZONE VIOLATIONS ---------- */

export interface EmergencyExitBlockageZoneViolation {
  zone: string;
  violations: number;

}

/* ---------- DETAILED REPORT RESPONSE ---------- */

export interface EmergencyExitBlockageDetailedReportResponse {
  data: EmergencyExitBlockageRecentViolation[];

  zones: string[];

  emergencyExitRoutes: string[];

  cameras: string[];

  total: number;
}

/* ---------- FILTER PARAMS ---------- */

export interface EmergencyExitBlockageFilterParams {
  violation?: string;

  emergencyExitRoute?: string;

  zone?: string;

  camera?: string;

  alarmTriggered?: string;

  startDate?: string;

  endDate?: string;
}

/* ---------- SOCKET PAYLOAD ---------- */

export interface EmergencyExitBlockageSocketPayload {
  serverTimestamp: string;

  kpi: EmergencyExitBlockageKpiItem[];

  zoneViolations: EmergencyExitBlockageZoneViolation[];

  recentViolations: EmergencyExitBlockageRecentViolation[];
}

/* ---------- API REQUEST TYPES ---------- */

export type EmergencyExitBlockageSingleReportRequest =
  {
    tenantId: string;

    violation?: string;

    emergencyExitRoute?: string;

    zone?: string;

    camera?: string;

    imageUrl?: string;

    time?: string;

    alarmTriggered?: boolean;
  };

export type EmergencyExitBlockageReportRequest =
  {
    tenantId: string;

    startDate?: string;

    endDate?: string;

    violation?: string;

    emergencyExitRoute?: string;

    zone?: string;

    camera?: string;
  };

/* ---------- OVERVIEW RESPONSE ---------- */

export type EmergencyExitBlockageResponse =
  {
    kpi: EmergencyExitBlockageKpiItem[];

    zoneViolations: EmergencyExitBlockageZoneViolation[];

    recentViolations: EmergencyExitBlockageRecentViolation[];
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