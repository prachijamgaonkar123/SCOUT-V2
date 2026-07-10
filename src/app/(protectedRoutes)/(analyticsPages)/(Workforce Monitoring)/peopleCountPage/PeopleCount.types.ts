import { PeopleCountKpiConfig } from "./PeopleCountConfig";


/* ---------- KPI ---------- */
export type KpiTitle = keyof typeof PeopleCountKpiConfig;
export type KpiColour = "red" | "green" | "blue";

export interface PeopleCountKpiItem {
  title: KpiTitle;
  value: number | string;
  colour: KpiColour;
}

/* ---------- VIOLATIONS ---------- */
export interface PeopleCountViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}

/* ---------- ZONE VIOLATIONS ---------- */
/* ---------- ZONE VIOLATIONS ---------- */
export interface PeopleCountZoneViolation {
  zone: string;
  entryCount: number;
  exitCount: number;
}

/* ---------- DETAILED REPORT ---------- */
export interface PeopleCountDetailedReportResponse {
  data: PeopleCountViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}

/* ---------- FILTER PARAMS ---------- */
export interface PeopleCountFilterParams {
  violation?: string;
  zone?: string;
  camera?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------- SOCKET PAYLOAD ---------- */
export interface PeopleCountSocketPayload {
  serverTimestamp: string;
  kpi: PeopleCountKpiItem[];
  zoneViolations: PeopleCountZoneViolation[];
  recentViolations: PeopleCountViolation[];
}

/* ---------- API REQUEST TYPES ---------- */
export type PeopleCountSingleReportRequest = {
  tenantId: string;
  violation?: string;
  enteredCount:number;
  exitCount:number;
  zone?: string;
  camera?: string;
  imageUrl?: string;
  time?: string;
  alarmTriggered?: boolean;
};

export type PeopleCountReportRequest = {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  violation?: string;
  zone?: string;
  camera?: string;
};

/* ---------- OVERVIEW RESPONSE ---------- */
export type PeopleCountResponse = {
  kpi: PeopleCountKpiItem[];
  zoneViolations: PeopleCountZoneViolation[];
  recentViolations: PeopleCountViolation[];
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