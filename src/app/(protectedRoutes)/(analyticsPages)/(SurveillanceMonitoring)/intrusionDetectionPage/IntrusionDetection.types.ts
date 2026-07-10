import { SvgIconComponent } from "@mui/icons-material";
import { intrusionKpiConfig } from "./IntrusionDetectionConfig";

/* ---------- FILTERS ---------- */
export interface IntrusionFilterParams {
  zone?: string;
  cameraId?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}
export type KpiColour = "red" | "green" | "blue";
/* ---------- KPI ---------- */
export interface IntrusionKpiItem {
  title: keyof typeof intrusionKpiConfig;
  value: number | string;
  colour: KpiColour;
}

export interface IntrusionKpiUi extends IntrusionKpiItem {
  icon: SvgIconComponent;
  tooltipMessage?: string;
}

/* ---------- ZONE VIOLATIONS ---------- */
export interface IntrusionZoneViolation {
  zone: string;
  incident: number;
}

/* ---------- VIOLATION ---------- */
export interface IntrusionViolation {
  incident: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}
export interface IntrusionDetailedRow {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  cameraId: string;
  alarmTriggered: boolean;
}
/* ---------- DETAILED REPORT ---------- */
export interface IntrusionDetailedReportResponse {
  data: IntrusionViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}

/* ---------- API REQUESTS ---------- */
export interface IntrusionBaseRequest {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  page?: number; // ✅ add
  limit?: number;
}

export interface IntrusionDetailedReportRequest extends IntrusionBaseRequest {
  zone?: string;
  cameraId?: string;
  alarmTriggered?: boolean;
}

export type IntrusionSingleReportRequest = {
  tenantId: string;
  violation?: string;
  zone?: string;
  alarmTriggered?: boolean;
  cameraId?: string;
  imageUrl?: string;
  time?: string;
};

export type IntrusionCsvReportRequest = {
  tenantId: string;
  startDate: string;
  endDate: string;
  violation?: string;
  zone?: string;
  cameraId?: string;
  alarmTriggered?: boolean;
};

export interface IntrusionSocketPayload {
  serverTimestamp: string;
  kpi: IntrusionKpiItem[];
  zoneViolations: IntrusionZoneViolation[];
  recentViolations: IntrusionViolation[];
}

export interface ShiftType {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  status: string;
}
