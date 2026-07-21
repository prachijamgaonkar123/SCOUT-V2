import {
  CriticalAreaSeries,
  WorkforceGatePoint,
  WorkforceMonitoringDashboardResponse,
} from "./WorkforceMonitoringDashboard.types";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

// ---------- Helpers ----------

// Wave shape across the day: low at night, peaks around midday, plus a small
// deterministic jitter so lines look like real activity instead of flat steps.
// Each series' peak is staggered by `seed` so multiple lines don't crest in
// lockstep — they spread out and read as distinct layers instead of parallel humps.
const waveValue = (base: number, hour: number, day: number, seed: number) => {
  const phaseShift = (seed * 3) % 24;
  const wave = Math.sin(((hour - 6 + phaseShift) / 24) * Math.PI * 2) + 1; // 0..2
  const jitter = ((day * 7 + hour * 3 + seed * 5) % 5) - 2; // -2..2
  return Math.max(0, Math.round(base * wave + jitter));
};

// One line per zone, 7 days of 4-hour buckets — same shape the API returns.
const generateZoneSeries = (
  zones: { zone: string; color: string; dailyValues: number[] }[]
): CriticalAreaSeries[] => {
  const now = new Date();
  return zones.map((z, seed) => {
    const data = [];
    for (let day = 6; day >= 0; day--) {
      const d = new Date(now);
      d.setDate(d.getDate() - day);
      const dateStr = d.toISOString().slice(0, 10);
      for (let h = 0; h < 24; h += 4) {
        data.push({
          date: dateStr,
          time: `${String(h).padStart(2, "0")}:00`,
          count: waveValue(z.dailyValues[day], h, day, seed),
        });
      }
    }
    return { zone: z.zone, color: z.color, data };
  });
};

// Gate point carrying both key styles: the typed API keys (idleCount, …) used by
// the scatter chart, and the bar-chart dataKeys (Idle, Working, NotPresent).
const gatePoint = (
  gate: string,
  idle: number,
  working: number,
  notPresent: number
): WorkforceGatePoint => ({
  gate,
  idleCount: idle,
  workingCount: working,
  notPresentCount: notPresent,
  Idle: idle,
  Working: working,
  NotPresent: notPresent,
});

// Security-personnel points use Absent/Present dataKeys in the bar chart.
const securityGatePoint = (
  gate: string,
  absent: number,
  present: number
): WorkforceGatePoint => ({
  gate,
  idleCount: 0,
  workingCount: present,
  notPresentCount: absent,
  Absent: absent,
  Present: present,
});

// ---------- MOCK DATA (typed as the union) ----------
export const mockWorkforceDashboardData: WorkforceMonitoringDashboardResponse[] = [
  {
    title: "Employee Presence in Critical Areas",
    kpi: {
      title: "Employee Presence in Critical Areas",
      // Matches backendEmployeePresenceData in EmployeePresenceCriticalAreaPage.tsx
      // (3 records, all alarmTriggered) so the KPI card agrees with the use case page.
      colour: "red",
      violationsCount: 3,
      lastDetection: "Critical Zone C",
      lastDetectionTime: "2025-09-25 09:41",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: generateZoneSeries([
          { zone: "Zone A", color: DASHBOARD_COLORS.primary, dailyValues: [3, 5, 2, 4, 6, 1, 4] },
          { zone: "Zone B", color: DASHBOARD_COLORS.warning, dailyValues: [2, 3, 1, 2, 4, 2, 3] },
          { zone: "Zone C", color: DASHBOARD_COLORS.workforce, dailyValues: [1, 2, 2, 1, 3, 1, 2] },
        ]),
      },
    },
  },
  {
    title: "Employee Presence in Restricted Areas",
    kpi: {
      title: "Employee Presence in Restricted Areas",
      // Matches backendEmployeePresenceData in EmployeePresenceRestrictedAreaPage.tsx
      // (3 records, all alarmTriggered) so the KPI card agrees with the use case page.
      colour: "red",
      violationsCount: 3,
      lastDetection: "Restricted Zone C",
      lastDetectionTime: "2025-09-25 09:41",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: generateZoneSeries([
          { zone: "Zone A", color: DASHBOARD_COLORS.primary, dailyValues: [2, 3, 1, 2, 4, 1, 2] },
          { zone: "Zone B", color: DASHBOARD_COLORS.warning, dailyValues: [1, 2, 2, 1, 3, 2, 1] },
          { zone: "Zone C", color: DASHBOARD_COLORS.workforce, dailyValues: [1, 1, 0, 2, 1, 1, 2] },
        ]),
      },
    },
  },
  {
    title: "Employee Idle Time Monitoring",
    kpi: {
      title: "Employee Idle Time Monitoring",
      // Matches backendIdleData in EmployeeIdleTime.tsx: only 1 of the 3
      // records has isIdle true, which is what "Total Idle Events" counts.
      colour: "blue",
      violationsCount: 1,
      lastDetection: "Zone A",
      lastDetectionTime: "2025-10-08 14:55",
    },
    graphs: {
      data: [
        gatePoint("Gate 1", 4, 12, 2),
        gatePoint("Gate 2", 2, 15, 1),
        gatePoint("Gate 3", 6, 9, 3),
        gatePoint("Gate 4", 3, 11, 4),
      ],
    },
  },
  {
    title: "Mobile Phone Usage in Restricted Zones",
    kpi: {
      title: "Mobile Phone Usage in Restricted Zones",
      // Matches backendMobilePhoneData in MobilePhoneUsage.tsx: 5 records,
      // which is what the page's own "Total Violations" KPI shows.
      colour: "blue",
      violationsCount: 5,
      lastDetection: "Parking Area",
      lastDetectionTime: "2025-09-23 17:36",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: generateZoneSeries([
          { zone: "Zone A", color: DASHBOARD_COLORS.primary, dailyValues: [2, 4, 1, 3, 5, 2, 3] },
          { zone: "Zone B", color: DASHBOARD_COLORS.warning, dailyValues: [1, 2, 3, 1, 2, 1, 2] },
          { zone: "Zone C", color: DASHBOARD_COLORS.workforce, dailyValues: [1, 1, 2, 2, 1, 0, 1] },
        ]),
      },
    },
  },
  {
    title: "Sleeping / Absence of Security Guards",
    kpi: {
      title: "Sleeping / Absence of Security Guards",
      // Matches backendSleepingSecurityData in SleepingSecurityPersonnel.tsx:
      // all 4 records trip sleeping or absence, so all 4 count as violations.
      colour: "blue",
      violationsCount: 4,
      lastDetection: "Assembly Line A",
      lastDetectionTime: "2025-09-24 08:27",
    },
    graphs: {
      data: [
        securityGatePoint("Gate 1", 1, 7),
        securityGatePoint("Gate 2", 0, 8),
        securityGatePoint("Gate 3", 2, 6),
        securityGatePoint("Gate 4", 1, 7),
      ],
    },
  },
];

// ---------- Shifts ----------
export const mockWorkforceShifts = [
  {
    shiftId: "shift-1",
    name: "Morning",
    startTime: "06:00",
    endTime: "14:00",
    breakStartTime: "10:00",
    breakEndTime: "10:30",
    status: "active",
  },
  {
    shiftId: "shift-2",
    name: "Afternoon",
    startTime: "14:00",
    endTime: "22:00",
    breakStartTime: "18:00",
    breakEndTime: "18:30",
    status: "active",
  },
  {
    shiftId: "shift-3",
    name: "Night",
    startTime: "22:00",
    endTime: "06:00",
    breakStartTime: "02:00",
    breakEndTime: "02:30",
    status: "active",
  },
];
