import { CrowdGatheringKpiConfig } from "./CrowdGatheringConfig";


/* ---------- KPI ---------- */
export type KpiTitle = keyof typeof CrowdGatheringKpiConfig;
export type KpiColour = "red" | "green" | "blue";

export interface CrowdGatheringInHazardousZonesKpiItem {
  title: KpiTitle;
  value: number | string;
  color: KpiColour;
}

/* ---------- VIOLATIONS ---------- */
export interface CrowdGatheringInHazardousZonesRecentViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}

/* ---------- ZONE VIOLATIONS ---------- */
export interface CrowdGatheringInHazardousZonesZoneViolation {
  zone: string;
   violations: number;
}

/* ---------- DETAILED REPORT ---------- */
export interface PeopleCountDetailedReportResponse {
  data: CrowdGatheringInHazardousZonesRecentViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}

/* ---------- FILTER PARAMS ---------- */
export interface CrowdGatheringInHazardousZonesFilterParams {
  violation?: string;
  zone?: string;
  camera?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------- SOCKET PAYLOAD ---------- */
export interface CrowdGatheringInHazardousZonesSocketPayload {
  serverTimestamp: string;
  kpi: CrowdGatheringInHazardousZonesKpiItem[];
  zoneViolations: CrowdGatheringInHazardousZonesZoneViolation[];
  recentViolations:CrowdGatheringInHazardousZonesRecentViolation[];
}

/* ---------- API REQUEST TYPES ---------- */
export type  CrowdGatheringInHazardousZonesSingleReportRequest = {
  tenantId: string;
  violation?: string;
  peopleCount?:string;
  zone?: string;
  camera?: string;
  imageUrl?: string;
  time?: string;
  alarmTriggered?: boolean;
};

export type  CrowdGatheringInHazardousZonesReportRequest = {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  violation?: string;
  zone?: string;
  camera?: string;
};

/* ---------- OVERVIEW RESPONSE ---------- */
export type  CrowdGatheringInHazardousZonesResponse = {
  kpi:  CrowdGatheringInHazardousZonesKpiItem[];
  zoneViolations: CrowdGatheringInHazardousZonesZoneViolation[];
  recentViolations:  CrowdGatheringInHazardousZonesRecentViolation[];
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