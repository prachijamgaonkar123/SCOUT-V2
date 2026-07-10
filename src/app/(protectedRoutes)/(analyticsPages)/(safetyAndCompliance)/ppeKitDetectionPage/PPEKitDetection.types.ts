import { SvgIconComponent } from "@mui/icons-material";
import { ppeKpiConfig } from "./PPEKitDetectionConfig";

export interface FilterParams {
  violation?: string;
  zone?: string;
  cameraId?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportParams extends Violation {
  cameraId: string;
  alarmTriggered: boolean;
}
export interface TableData {
  id: number;
  helmet: boolean;
  vest: boolean;
  glasses: boolean;
  zone: string;
  snapshot: string;
  cameraid: string;
  alarmTriggered: boolean;
  createdAt: string;
}

// ✅ Request Type
export interface PpeKitDetectionRequest {
  tenantId: string;
}

// ✅ Response Type (match with your NestJS DTO)
export interface PpeKitDetectionResponse {
  totalViolations: number;
  currentUnsafeZone: string | null;
  lastDetectionTime: string | null;
  missingHelmet: number;
  missingVest: number;
  missingGlasses: number;
}

export interface PPEKpi {
  title: string;
  value: number | string;
  icon: SvgIconComponent; // required, matches KpiCardProps
  tooltipMessage?: string;
}
export type KpiColour = "red" | "green" | "blue";

export interface KpiItem {
  title: keyof typeof ppeKpiConfig;
  value: number | string;
  colour: KpiColour;
}

export interface SubViolationInterface {
  label: string;
  value: number;
}

export interface ZoneViolationInteface {
  zone: string;
  violations: number;
  subViolations: SubViolationInterface[];
}
export type PpeSingleReportRequest = {
  tenantId: string;
  violation?: string;
  zone?: string;
  alarmTriggered?: boolean;
  cameraId?: string;
  imageUrl?: string;
  time?: string;
};

export type PpeCsvReportRequest = {
  tenantId: string;
  startDate: string;
  endDate: string;
  violation?: string;
  zone?: string;
  cameraId?: string;
  alarmTriggered?: boolean;
};

export interface Violation {
  voilation: string;
  zone: string;
  time: string;
  imageUrl: string;
  incident: string;
  [key: string]: string | number | boolean; // extra dynamic fields
}
export interface PpeSocketPayload {
  serverTimestamp: string;
  kpi: KpiItem[];
  zoneViolations: ZoneViolationInteface[];
  recentViolations: PPEViolation[];
}
export interface PPEViolation extends Violation {
  cameraId: string;
  alarmTriggered: boolean;
}

export interface DetailedReportResponse {
  data: PPEViolation[];
  zones: string[];
  cameras: string[];
}
