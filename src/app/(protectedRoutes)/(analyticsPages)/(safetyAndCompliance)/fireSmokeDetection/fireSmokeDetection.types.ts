import { fireSmokeDetectionKpiConfig } from "./fireSmokeDetectionConfig";



export interface FilterParams {
  incident?: string;
  zone?: string;
  cameraId?: string;
  startDate?: string;
  endDate?: string;
}
export type KpiColour = "red" | "green" | "blue";
export interface FireSmokeDetectionKpiItem {
  title: keyof typeof fireSmokeDetectionKpiConfig;
  value: number | string;
  colour: KpiColour;
}

export interface FireSmokeDetectionViolation {
  incident: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  alarmTriggered: string;
  [key: string]: string | number | boolean ;
}

export interface FireSmokeDetectionZoneViolation {
  zone: string;
  incidents: number;
  subViolations: {
    label: string;
    value: number;
  }[];
}

export interface FireSmokeDetectionDetailedReportResponse {
  data: FireSmokeDetectionViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}
export interface FireSmokeDetectionSocketPayload {
  serverTimestamp: string;
  kpi: FireSmokeDetectionKpiItem[];
  zoneViolations: FireSmokeDetectionZoneViolation[];
  recentViolations: FireSmokeDetectionViolation[];
}

export interface FireSmokeDetectionFilterParams {
  incident?: string;
  zone?: string;
  camera?: string;
  startDate?: string;
  endDate?: string;
  alarmTriggered?: string;
}



export type FireSmokeDetectionSingleReportRequest = {
  tenantId: string;
  incident?: string;
  zone?: string;
  alarmTriggered?: string;
  cameraId?: string;
  imageUrl?: string;
  time?: string;
};
export type FireSmokeDetectionReportRequest = {
  tenantId: string;
  startDate: string;
  endDate: string;
  incident?: string;
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

export type FireSmokeDetectionResponse = {
  kpi: FireSmokeDetectionKpiItem[];
  zoneViolations: FireSmokeDetectionZoneViolation[];
  recentViolations: FireSmokeDetectionViolation[];
};