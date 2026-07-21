import {
  SurveillanceDashboardResponse,
  TrendSeries,
} from "./SurveillanceMonitoringDashboard.types";
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
    { zone: "Zone A", color: DASHBOARD_COLORS.primary, dailyValues: a },
    { zone: "Zone B", color: DASHBOARD_COLORS.warning, dailyValues: b },
    { zone: "Zone C", color: DASHBOARD_COLORS.workforce, dailyValues: c },
  ]);

// ---------- MOCK DATA (typed as the union) ----------
export const mockSurveillanceDashboardData: SurveillanceDashboardResponse[] = [
  {
    title: "Intrusion Detection at Perimeter",
    kpi: {
      title: "Intrusion Detection at Perimeter",
      // Matches backendIntrusionData in IntrusionDetection.tsx: 4 records,
      // most recent at "Internal secure storage" (updatedAt 18:16).
      colour: "red",
      violationsCount: 4,
      lastDetection: "Internal secure storage",
      lastDetectionTime: "2025-09-23 18:16",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: zoneSet([3, 5, 2, 4, 6, 1, 4], [2, 3, 1, 2, 4, 2, 3], [1, 2, 2, 1, 3, 1, 2]),
      },
    },
  },
  {
    title: "Camera Tampering Detection",
    kpi: {
      title: "Camera Tampering Detection",
      // Matches backendData in "Camera Tampering.tsx": 3 records (all
      // tampered, none offline), most recent at "Welding Station".
      colour: "red",
      violationsCount: 3,
      lastDetection: "Welding Station",
      lastDetectionTime: "2025-09-23 16:12",
    },
    graphs: {
      data: { granularity: "hour", series: [] }, // this use case is pie-chart driven
      pieCharts: {
        onlineCameras: [
          { zone: "Zone A", count: 14, color: DASHBOARD_COLORS.primary },
          { zone: "Zone B", count: 10, color: DASHBOARD_COLORS.warning },
          { zone: "Zone C", count: 8, color: DASHBOARD_COLORS.workforce },
        ],
        offlineCameras: [
          { zone: "Zone A", count: 1, color: DASHBOARD_COLORS.primary },
          { zone: "Zone B", count: 2, color: DASHBOARD_COLORS.warning },
          { zone: "Zone C", count: 1, color: DASHBOARD_COLORS.workforce },
        ],
        tamperedCameras: [
          { zone: "Zone A", count: 1, color: DASHBOARD_COLORS.primary },
          { zone: "Zone B", count: 0, color: DASHBOARD_COLORS.warning },
          { zone: "Zone C", count: 2, color: DASHBOARD_COLORS.workforce },
        ],
      },
    },
  },
  {
    title: "Movement During Shutdown Hours",
    kpi: {
      title: "Movement During Shutdown Hours",
      // Matches backendPeoplePresenceData in PeoplePresence.tsx: 14 movement
      // events recorded, most recent at "Zone D" (updatedAt 21:16).
      colour: "red",
      violationsCount: 14,
      lastDetection: "Zone D",
      lastDetectionTime: "2025-09-23 21:16",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: zoneSet([1, 2, 0, 1, 3, 1, 2], [2, 1, 1, 0, 2, 1, 1], [0, 1, 1, 1, 2, 0, 1]),
      },
    },
  },
  {
    title: "Unauthorized Access in Restricted Areas",
    kpi: {
      // Not an active use case on this menu yet (commented out of
      // analyticsMenu) — kept last so its blank filler tile lands in the
      // 4th KPI slot, and its tab is removed entirely below.
      title: "Unauthorized Access in Restricted Areas",
      colour: "gray",
      violationsCount: 0,
      lastDetection: "-",
      lastDetectionTime: "",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: zoneSet([2, 3, 1, 2, 4, 1, 2], [1, 2, 2, 1, 3, 2, 1], [1, 1, 0, 2, 1, 1, 2]),
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
