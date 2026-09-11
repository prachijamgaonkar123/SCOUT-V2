import { MuiIcon } from "@/app/config/dashboardTheme";
import { ZoneOccupancyMonitoringKpiConfig } from "./ZoneOccupancyMonitoringConfig";

/* ---------- KPI ---------- */
export type KpiTitle = keyof typeof ZoneOccupancyMonitoringKpiConfig;
export type KpiColour = "red" | "green" | "blue";

export interface ZoneOccupancyMonitoringKpiItem {
  title: KpiTitle;
  value: number | string;
  color: KpiColour;
}
export interface ZoneOccupancyTrendDataPoint {
  date: string;
  value: number;
}

export interface ZoneOccupancyChartDataPoint {
  label: string;
  totalViolations: number;
}
/* ---------- VIOLATIONS ---------- */
export interface ZoneOccupancyMonitoringRecentViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  occupancyCount: number;
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}

/* ---------- ZONE VIOLATIONS ---------- */
export interface ZoneOccupancyMonitoringZoneViolation {
  zone: string;
  incidentCount: number;
  peakOccupancyCount: number;
}

/* ---------- DETAILED REPORT ---------- */
export interface ZoneOccupancyMonitoringDetailedReportResponse {
  data: ZoneOccupancyMonitoringRecentViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}

/* ---------- FILTER PARAMS ---------- */
export interface ZoneOccupancyMonitoringFilterParams {
  violation?: string;
  zone?: string;
  camera?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------- SOCKET PAYLOAD ---------- */
export interface ZoneOccupancyMonitoringSocketPayload {
  serverTimestamp: string;
  kpi: ZoneOccupancyMonitoringKpiItem[];
  zoneViolations: ZoneOccupancyMonitoringZoneViolation[];
  recentViolations: ZoneOccupancyMonitoringRecentViolation[];
  chartData: ZoneOccupancyChartDataPoint[];
}

/* ---------- API REQUEST TYPES ---------- */
export type ZoneOccupancyMonitoringSingleReportRequest = {
  tenantId: string;
  violation?: string;
  occupancyCount?: string;
  zone?: string;
  camera?: string;
  imageUrl?: string;
  time?: string;
  alarmTriggered?: boolean;
};

export type ZoneOccupancyMonitoringReportRequest = {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  violation?: string;
  zone?: string;
  camera?: string;
};

/* ---------- OVERVIEW RESPONSE ---------- */
export type ZoneOccupancyMonitoringResponse = {
  kpi: ZoneOccupancyMonitoringKpiItem[];
  zoneViolations: ZoneOccupancyMonitoringZoneViolation[];
  recentViolations: ZoneOccupancyMonitoringRecentViolation[];
  chartData: ZoneOccupancyChartDataPoint[];
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
export type BreakdownTone = "red" | "info" | "green";
export interface BreakdownMetric {
  icon: MuiIcon;
  value: string | number;
  label: string;
  tone?: BreakdownTone;
  valueFontSize?: number;
}
