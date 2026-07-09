import {
  SurveillanceDashboardResponse,
  TrendSeries,
} from "./SurveillanceMonitoringDashboard.types";

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
): TrendSeries[] => {
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

const zoneSet = (a: number[], b: number[], c: number[]) =>
  generateZoneSeries([
    { zone: "Zone A", color: "#93C4F5", dailyValues: a },
    { zone: "Zone B", color: "#F5A693", dailyValues: b },
    { zone: "Zone C", color: "#A8E6CF", dailyValues: c },
  ]);

// ---------- MOCK DATA (typed as the union) ----------
export const mockSurveillanceDashboardData: SurveillanceDashboardResponse[] = [
  {
    title: "Intrusion Detection at Perimeter",
    kpi: {
      title: "Intrusion Detection at Perimeter",
      colour: "red",
      violationsCount: 7,
      lastDetection: "Zone A",
      lastDetectionTime: "2026-07-08 14:42:07",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: zoneSet([3, 5, 2, 4, 6, 1, 4], [2, 3, 1, 2, 4, 2, 3], [1, 2, 2, 1, 3, 1, 2]),
      },
    },
  },
  {
    title: "Unauthorized Access in Restricted Areas",
    kpi: {
      title: "Unauthorized Access in Restricted Areas",
      colour: "red",
      violationsCount: 4,
      lastDetection: "Zone B",
      lastDetectionTime: "2026-07-08 11:15:08",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: zoneSet([2, 3, 1, 2, 4, 1, 2], [1, 2, 2, 1, 3, 2, 1], [1, 1, 0, 2, 1, 1, 2]),
      },
    },
  },
  {
    title: "Camera Tampering Detection",
    kpi: {
      title: "Camera Tampering Detection",
      colour: "red",
      violationsCount: 3,
      lastDetection: "Zone C",
      lastDetectionTime: "2026-07-08 09:37:02",
    },
    graphs: {
      data: { granularity: "hour", series: [] }, // this use case is pie-chart driven
      pieCharts: {
        onlineCameras: [
          { zone: "Zone A", count: 14, color: "#A8E6CF" },
          { zone: "Zone B", count: 10, color: "#93C4F5" },
          { zone: "Zone C", count: 8, color: "#FFEAA7" },
        ],
        offlineCameras: [
          { zone: "Zone A", count: 1, color: "#ffcdd2" },
          { zone: "Zone B", count: 2, color: "#F5A693" },
          { zone: "Zone C", count: 1, color: "#D4A5FF" },
        ],
        tamperedCameras: [
          { zone: "Zone A", count: 1, color: "#ffcdd2" },
          { zone: "Zone B", count: 0, color: "#FFEAA7" },
          { zone: "Zone C", count: 2, color: "#B0E0E6" },
        ],
      },
    },
  },
  {
    title: "Movement During Shutdown Hours",
    kpi: {
      title: "Movement During Shutdown Hours",
      colour: "red",
      violationsCount: 10,
     lastDetection: "Zone C",
      lastDetectionTime: "2026-07-08 09:37:02",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: zoneSet([1, 2, 0, 1, 3, 1, 2], [2, 1, 1, 0, 2, 1, 1], [0, 1, 1, 1, 2, 0, 1]),
      },
    },
  },
];

// ---------- Shifts ----------
export const mockSurveillanceShifts = [
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
