import {
  CriticalAreaSeries,
  WorkforceGatePoint,
  WorkforceMonitoringDashboardResponse,
} from "./WorkforceMonitoringDashboard.types";

// ---------- Helpers ----------

// Wave shape across the day: low at night, peaks around midday, plus a small
// deterministic jitter so lines look like real activity instead of flat steps.
const waveValue = (base: number, hour: number, day: number, seed: number) => {
  const wave = Math.sin(((hour - 6) / 24) * Math.PI * 2) + 1; // 0..2, peak ~12:00
  const jitter = ((day * 7 + hour * 3 + seed * 5) % 3) - 1; // -1..1
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
<<<<<<< HEAD
      colour: "red",
      violationsCount: 10,
      lastDetection: "Zone B",
      lastDetectionTime: "2026-07-08 10:22:44",
=======
      colour: "green",
      violationsCount: 0,
      lastDetection: "No Detections",
      lastDetectionTime: "",
>>>>>>> a61e6c7 (push scout-v2)
    },
    graphs: {
      data: {
        granularity: "hour",
        series: generateZoneSeries([
          { zone: "Zone A", color: "#93C4F5", dailyValues: [3, 5, 2, 4, 6, 1, 4] },
          { zone: "Zone B", color: "#F5A693", dailyValues: [2, 3, 1, 2, 4, 2, 3] },
          { zone: "Zone C", color: "#A8E6CF", dailyValues: [1, 2, 2, 1, 3, 1, 2] },
        ]),
      },
    },
  },
  {
    title: "Employee Presence in Restricted Areas",
    kpi: {
      title: "Employee Presence in Restricted Areas",
      colour: "red",
      violationsCount: 5,
      lastDetection: "Zone B",
      lastDetectionTime: "2026-07-08 10:22:44",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: generateZoneSeries([
          { zone: "Zone A", color: "#93C4F5", dailyValues: [2, 3, 1, 2, 4, 1, 2] },
          { zone: "Zone B", color: "#F5A693", dailyValues: [1, 2, 2, 1, 3, 2, 1] },
          { zone: "Zone C", color: "#A8E6CF", dailyValues: [1, 1, 0, 2, 1, 1, 2] },
        ]),
      },
    },
  },
  {
    title: "Employee Idle Time Monitoring",
    kpi: {
      title: "Employee Idle Time Monitoring",
      colour: "blue",
      violationsCount: 12,
      lastDetection: "Gate 3",
      lastDetectionTime: "2026-07-08 15:10:25",
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
      colour: "blue",
      violationsCount: 6,
      lastDetection: "Zone A",
      lastDetectionTime: "2026-07-08 12:05:47",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: generateZoneSeries([
          { zone: "Zone A", color: "#93C4F5", dailyValues: [2, 4, 1, 3, 5, 2, 3] },
          { zone: "Zone B", color: "#F5A693", dailyValues: [1, 2, 3, 1, 2, 1, 2] },
          { zone: "Zone C", color: "#A8E6CF", dailyValues: [1, 1, 2, 2, 1, 0, 1] },
        ]),
      },
    },
  },
  {
    title: "Sleeping / Absence of Security Guards",
    kpi: {
      title: "Sleeping / Absence of Security Guards",
      colour: "blue",
      violationsCount: 2,
      lastDetection: "Gate 1",
      lastDetectionTime: "2026-07-08 04:15:49",
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
