import { surveillanceDashboardConfig } from "./SurveillanceMonitoringDashboardConfig";

export interface GraphResponsePoint {
 date: string;
  time?: string;  
  day?: string; 
    count: number;
}

export interface TrendSeries {
  zone: string;
  color:string;
  data: GraphResponsePoint[];
}

export interface TrendResponse {
  granularity: "hour" | "weekday" | "week";
  series: TrendSeries[];
}

export interface SurveillanceDashboardResponse {
  // "Unauthorized Access in Restricted Areas" isn't in surveillanceDashboardConfig
  // (no icon/route — it's rendered as a blank filler tile, not a real KPI card),
  // so it's added explicitly alongside the config-backed titles.
  title:
    | keyof typeof surveillanceDashboardConfig
    | "Unauthorized Access in Restricted Areas";
  kpi: {
    title: string;
    violationsCount?: number;
    lastDetection?: string;
    lastDetectionTime?: string;
    colour: "red" | "green" | "blue" | "gray";
  };
  graphs: {
    data: TrendResponse;
     pieCharts?: CameraTamperingPieCharts;
  };
}

export interface SurveillanceSocketPayload {
  type: "SURVEILLANCE_UPDATE";
  tenantId: string;
  serverTimestamp: string;
  data: SurveillanceDashboardResponse[];
}

export interface PieChartItem {
  zone: string;
  count: number;
  color?: string;
}

export interface CameraTamperingPieCharts {
  onlineCameras: PieChartItem[];
  offlineCameras: PieChartItem[];
  tamperedCameras: PieChartItem[];
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