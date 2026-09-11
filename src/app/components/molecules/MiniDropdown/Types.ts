export type AlertCategory =
  | "Safety"
  | "Surveillance"
  | "Operational"
  | "Employee Monitoring";

export type AlertSeverity = "critical" | "non-critical";

export type AlertStatus = "new" | "acknowledged" | "resolved";

export interface SecurityAlertEvent {
  /** Unique id for this row. Used as the React key and as the expand/reclassify state key. */
  id: string;
  /** Tenant the alert belongs to, e.g. "TEN-04471". Rendered in the expanded field grid. */
  tenantId: string;
  /** Human-facing alert identifier, e.g. "AL-118820-CE14". Rendered in the expanded field grid. */
  alertId: string;
  /** Current violation classification, e.g. "PPE Violation". Row title + reclassify dropdown value. */
  alertType: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  /** Camera source label, e.g. "CAM-EAST-14". */
  camera: string;
  zone: string;
  /** Pre-formatted display timestamp, e.g. "14:32:07" or "2026-08-20 14:32:07 IST". */
  timestamp: string;
  /** Snapshot URL. When omitted, the thumbnail falls back to the camera-frame placeholder pattern. */
  imageUrl?: string;
  /** Caption shown at the bottom of the thumbnail, e.g. "frame_1432.jpg". */
  imageFileName?: string;
  /** Shows the pulsing "REC" badge on the thumbnail. */
  isRecording?: boolean;
  notes?: string;
  /**
   * Options offered in this row's "Reclassify Violation" dropdown.
   * Falls back to DEFAULT_VIOLATIONS_BY_CATEGORY[category] when omitted.
   */
  violationOptions?: string[];
}

export interface RecentEventPopupProps {
  /** The alerts to render as rows. This is the only required prop — the sole data source for the list. */
  events: SecurityAlertEvent[];
  /**
   * Text shown after "Active Alerts — " in the toolbar heading.
   * Optional — defaults to the first event's tenantId.
   */
  tenantLabel?: string;
  /**
   * Total number of alerts available (e.g. before pagination), for the "X of Y shown" counter.
   * Optional — defaults to events.length.
   */
  totalCount?: number;
  /**
   * Event ids that should render expanded on mount.
   * Optional — defaults to [events[0].id], matching the reference design where the first row opens by default.
   */
  defaultExpandedEventIds?: string[];
  /** Optional callback fired whenever a row is expanded or collapsed. */
  onToggleRow?: (eventId: string, isExpanded: boolean) => void;
  /** Optional callback fired when a new violation is chosen in a row's reclassify dropdown. */
  onReclassify?: (eventId: string, newViolationType: string) => void;
  /** Optional className applied to the root element, for layout placement inside a host page. */
  className?: string;
}

export const DEFAULT_VIOLATIONS_BY_CATEGORY: Record<AlertCategory, string[]> = {
  Safety: [
    "PPE Violation",
    "Fall Detected",
    "Fire / Smoke Detected",
    "Restricted Area Breach",
    "Spill Hazard",
  ],
  Surveillance: [
    "Unauthorized Access",
    "Perimeter Breach",
    "Suspicious Loitering",
    "Tailgating",
    "Object Left Behind",
  ],
  Operational: [
    "Equipment Malfunction",
    "Camera Offline",
    "Queue Threshold Exceeded",
    "Temperature Anomaly",
    "Door Left Open",
  ],
  "Employee Monitoring": [
    "Unauthorized Break",
    "Idle Time Exceeded",
    "Uniform Non-Compliance",
    "Attendance Mismatch",
    "Zone Deviation",
  ],
};
