export interface CameraTamperingViolation {
  violation: string;
  zone: string;
  time: string;
  imageUrl: string;
  camera: string;
  alarmTriggered: boolean;
  [key: string]: string | number | boolean;
}

export interface CameraTamperingZoneViolation {
  zone: string;
  violations: number;
  subViolations: {
    label: string;
    value: number;
  }[];
}

export interface CameraTamperingKpiItem {
  title: string;
  value: number | string;
  color: "red" | "green" | "blue";
}


export interface CameraTamperingDetailedReportResponse {
  data: CameraTamperingViolation[];
  zones: string[];
  cameras: string[];
  total: number;
}
export type CameraTamperingReportRequest = {
  tenantId: string;
  startDate: string;
  endDate: string;
  violation?: string;
  zone?: string;
  camera?: string;
};

export type CameraTamperingSingleReportRequest = {
  tenantId: string;
  violation?: string;
  zone?: string;
  alarmTriggered?: boolean;
  camera?: string;
  imageUrl?: string;
  time?: string;
};

export type CameraTamperingResponse = {
  kpi: CameraTamperingKpiItem[];
  zoneViolations: CameraTamperingZoneViolation[];
  recentViolations: CameraTamperingViolation[];
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
export interface CameraTamperingFilterParams {
  violation?: string;
  zone?: string;
  camera?: string;
  alarmTriggered?: string;
  startDate?: string;
  endDate?: string;
}

export interface CameraTamperingSocketPayload {
  serverTimestamp: string;
  kpi: CameraTamperingKpiItem[];
  zoneViolations: CameraTamperingZoneViolation[];
  recentViolations: CameraTamperingViolation[];
}