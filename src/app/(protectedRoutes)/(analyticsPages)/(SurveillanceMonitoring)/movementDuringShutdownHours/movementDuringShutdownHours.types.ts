import { movemnetDuringShutDownHrKpiConfig } from "./movementDuringShutdownHoursConfig";

export type KpiColour = "red" | "green" | "blue";
/* ---------- KPI ---------- */
export interface MovemnetDuringShutDownHrKpiItem {
  title: keyof typeof movemnetDuringShutDownHrKpiConfig;
  value: number | string;
  colour: KpiColour;
}

/* ---------- ZONE VIOLATIONS ---------- */
export interface MovemnetDuringShutDownHrZoneViolation {
  zone: string;
  MovementEvents: number;
}

/* ---------- Recent VIOLATION ---------- */
export interface MovemnetDuringShutDownHrViolation {
  incident: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  alarmTriggered: boolean;
  peopleCount: number;
  [key: string]: string | number | boolean;
}
/* ---------- DETAILED REPORT ---------- */
export interface MovemnetDuringShutDownHrDetailedReportResponse {
  data: MovemnetDuringShutDownHrViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}

/* ---------- API REQUESTS ---------- */
export interface MovemnetDuringShutDownHrBaseRequest {
  tenantId: string;
  startDate?: string;
  endDate?: string;
}

export interface MovemnetDuringShutDownHrDetailedReportRequest extends MovemnetDuringShutDownHrBaseRequest {
  zone?: string;
  cameraId?: string;
  alarmTriggered?: boolean;
  page?: number; // ✅ add
  limit?: number;
}

export type MovemnetDuringShutDownHrSingleReportRequest = {
  tenantId: string;
  violation?: string;
  zone?: string;
  alarmTriggered?: boolean;
  cameraId?: string;
  imageUrl?: string;
  time?: string;
  peopleCount: number;
};

export type MovemnetDuringShutDownHrCsvReportRequest = {
  tenantId: string;
  startDate: string;
  endDate: string;
  violation?: string;
  zone?: string;
  cameraId?: string;
  alarmTriggered?: boolean;
};

export interface MovemnetDuringShutDownHrSocketPayload {
  serverTimestamp: string;
  kpi: MovemnetDuringShutDownHrKpiItem[];
  zoneViolations: MovemnetDuringShutDownHrZoneViolation[];
  recentViolations: MovemnetDuringShutDownHrViolation[];
}

export interface ShiftTypeMovement {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  status: string;
}

/* ---------- FILTERS ---------- */
export interface MovemnetDuringShutDownHrFilterParams {
  zone?: string;
  cameraId?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}
