import { EmployeeIdelTimeKpiConfig } from "./EmployeeIdelTimeConfig";

export interface Violation {
  voilation: string;
  zone: string;
  time: string;
  imageUrl: string;
  incident: string;
  [key: string]: string | number | boolean; // extra dynamic fields
}

export interface EmployeeIdleTimeViolation extends Violation {
  cameraId: string;
}

export interface FilterParams {
  violation?: string;
  zone?: string;
  cameraId?: string;
  startDate?: string;
  endDate?: string;
}
export type KpiColour = "red" | "green" | "blue";
export interface EmployeeIdleKpiItem {
  title: keyof typeof EmployeeIdelTimeKpiConfig;
  value: number | string;
  colour: KpiColour;
}

export interface EmployeeIdleViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  cameraId: string;
  [key: string]: string | number | boolean;
}

export interface EmployeeIdleZoneViolation {
  zone: string;
  incidents: number;
  subViolations: {
    label: string;
    value: number;
  }[];
}

export interface EmployeeIdleTimeDetailedReportResponse {
  data: EmployeeIdleViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}
export interface EmployeeIdleTimeSocketPayload {
  serverTimestamp: string;
  kpi: EmployeeIdleKpiItem[];
  zoneViolations: EmployeeIdleZoneViolation[];
  recentViolations: EmployeeIdleTimeViolation[];
}

export interface EmployeeIdelTimeFilterParams {
  violation?: string;
  zone?: string;
  cameraId?: string;
  startDate?: string;
  endDate?: string;
}

export type EmployeeIdleTimeSingleReportRequest = {
  tenantId: string;
  violation?: string;
  zone?: string;

  cameraId?: string;
  imageUrl?: string;
  time?: string;
};

export type EmployeeIdleTimeCsvReportRequest = {
  tenantId: string;
  startDate: string;
  endDate: string;
  violation?: string;
  zone?: string;
  cameraId?: string;
};

export interface ShiftType {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  status: string;
}
