import type { AlertCategory, SecurityAlertEvent } from '@/app/components/molecules/MiniDropdown/Types';
import type { Alert, AlertSeverity } from '@/app/components/molecules/AlertsTable/AlertsTable';
import type { UseCaseCategory } from '@/app/config/dashboardTheme';

// Single source of truth for the alerts page: the popup and the table both
// render from this same list, so acting on an alert in one place is
// immediately reflected in the other instead of drifting out of sync.
export const mockAlerts: Alert[] = [
  {
    id: 'ALT-20456',
    timestamp: '2026-07-07T17:42:00',
    severity: 'critical',
    title: 'Fire and Smoke Detection',
    camera: 'CAM-08',
    zone: 'Warehouse',
    status: 'new',
    category: 'safety',
    imageUrl: '/img/fire-smoke/fire1.png',
    imageFileName: 'fire1.png',
  },
  {
    id: 'ALT-20455',
    timestamp: '2026-07-07T17:40:00',
    severity: 'non-critical',
    title: 'PPE Violation',
    camera: 'CAM-12',
    zone: 'Assembly Line',
    status: 'new',
    category: 'safety',
    imageUrl: '/img/ppe-kit-detection/no-helmet.png',
    imageFileName: 'no-helmet.png',
  },
  {
    id: 'ALT-20453',
    timestamp: '2026-07-07T17:37:00',
    severity: 'non-critical',
    title: 'Forklift / Vehicle in Walkways',
    camera: 'CAM-04',
    zone: 'Loading Dock',
    status: 'new',
    category: 'safety',
    imageUrl: '/img/forklift-vehicle-detection/f1.png',
    imageFileName: 'f1.png',
  },
  {
    id: 'ALT-20450',
    timestamp: '2026-07-07T17:28:00',
    severity: 'non-critical',
    title: 'Crowd Detection in Hazardous Zones',
    camera: 'CAM-09',
    zone: 'Assembly Line',
    status: 'new',
    category: 'safety',
    imageUrl: '/img/crowd/c1.png',
    imageFileName: 'c1.png',
  },
  {
    id: 'ALT-20447',
    timestamp: '2026-07-07T17:12:00',
    severity: 'critical',
    title: 'Intrusion Detection at Perimeter',
    camera: 'CAM-05',
    zone: 'Gate A',
    status: 'new',
    category: 'surveillance',
    imageUrl: '/img/intrusion-detection-perimeter/i1.png',
    imageFileName: 'i1.png',
  },
  // Historical rows — already triaged, never surfaced in the popup.
  { id: 'ALT-20454', timestamp: '2026-07-07T17:39:00', severity: 'non-critical', title: 'Employee Presence in Restricted Areas', camera: 'CAM-15', zone: 'Gate B', status: 'resolved', category: 'workforce' },
  { id: 'ALT-20451', timestamp: '2026-07-07T17:31:00', severity: 'critical', title: 'Fire and Smoke Detection', camera: 'CAM-20', zone: 'Warehouse', status: 'acknowledged', category: 'safety' },
  { id: 'ALT-20449', timestamp: '2026-07-07T17:24:00', severity: 'non-critical', title: 'Vehicle Unloading / Loading Monitoring', camera: 'CAM-06', zone: 'Loading Dock', status: 'resolved', category: 'operational' },
  { id: 'ALT-20448', timestamp: '2026-07-07T17:19:00', severity: 'non-critical', title: 'Vehicle Count & ANPR at Gates', camera: 'CAM-14', zone: 'Gate A', status: 'resolved', category: 'operational' },
  { id: 'ALT-20446', timestamp: '2026-07-07T17:05:00', severity: 'non-critical', title: 'Canteen Usage Monitoring', camera: 'CAM-08', zone: 'canteen A', status: 'resolved', category: 'operational' },
  { id: 'ALT-20445', timestamp: '2026-07-07T16:58:00', severity: 'non-critical', title: 'Mobile Phone Usage in Restricted Zones', camera: 'CAM-09', zone: 'Production Floor', status: 'resolved', category: 'workforce' },
];

const CATEGORY_TO_POPUP: Record<UseCaseCategory, AlertCategory> = {
  safety: 'Safety',
  surveillance: 'Surveillance',
  operational: 'Operational',
  workforce: 'Employee Monitoring',
};

// AlertRow's "time since detection" parser expects "DD:MM:YYYY HH:mm:ss".
function toPopupTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}:${pad(d.getMonth() + 1)}:${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function toPopupEvent(alert: Alert, tenantId = 'TEN-04471'): SecurityAlertEvent {
  return {
    id: alert.id,
    tenantId,
    alertId: alert.id,
    alertType: alert.title,
    category: CATEGORY_TO_POPUP[alert.category],
    severity: alert.severity,
    status: alert.status,
    camera: alert.camera,
    zone: alert.zone,
    timestamp: toPopupTimestamp(alert.timestamp),
    imageUrl: alert.imageUrl,
    imageFileName: alert.imageFileName,
    isRecording: alert.severity === 'critical',
  };
}

// -----------------------------------------------------------------------
// Derived views — every alerts-page widget (stat cards, live feed, top
// cameras, distribution donut) reads from these instead of keeping its own
// hardcoded numbers, so nothing on the page can drift out of sync with the
// actual alert list.
// -----------------------------------------------------------------------

export interface AlertStats {
  critical: number;
  nonCritical: number;
  acknowledged: number;
  resolved: number;
}

export function getAlertStats(alerts: Alert[]): AlertStats {
  return alerts.reduce<AlertStats>(
    (acc, alert) => {
      if (alert.severity === 'critical') acc.critical += 1;
      else acc.nonCritical += 1;
      if (alert.status === 'acknowledged') acc.acknowledged += 1;
      if (alert.status === 'resolved') acc.resolved += 1;
      return acc;
    },
    { critical: 0, nonCritical: 0, acknowledged: 0, resolved: 0 },
  );
}

export interface LiveAlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  camera: string;
  zone: string;
  time: string;
  category: UseCaseCategory;
}

export function getLiveAlerts(alerts: Alert[], limit = 4): LiveAlertItem[] {
  return [...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map((alert) => ({
      id: alert.id,
      severity: alert.severity,
      title: alert.title,
      camera: alert.camera,
      zone: alert.zone,
      time: new Date(alert.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      category: alert.category,
    }));
}

export interface TopCameraItem {
  id: string;
  zone: string;
  count: number;
}

export function getTopCameras(alerts: Alert[], limit = 4): TopCameraItem[] {
  const byCamera = new Map<string, TopCameraItem>();
  for (const alert of alerts) {
    const existing = byCamera.get(alert.camera);
    if (existing) {
      existing.count += 1;
    } else {
      byCamera.set(alert.camera, { id: alert.camera, zone: alert.zone, count: 1 });
    }
  }
  return Array.from(byCamera.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
