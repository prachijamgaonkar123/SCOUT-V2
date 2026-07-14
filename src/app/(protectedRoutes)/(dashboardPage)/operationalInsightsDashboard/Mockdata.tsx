import {
  CanteenGraphPoint,
  OperationalInsightsDashboardResponse,
  PeopleInsideSeriesPoint,
  ShiftType,
  ZoneCountSeries,
} from "./OperationalInsightsDashboard.types";
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

// Bell curve around a meal's peak hour so canteen lines peak at breakfast,
// lunch and dinner times respectively.
const mealValue = (peakHour: number, hour: number, day: number, amp: number) => {
  const spread = Math.exp(-((hour - peakHour) ** 2) / 10);
  const jitter = ((day * 5 + hour * 3) % 3) - 1; // -1..1
  return Math.max(0, Math.round(amp * spread + jitter));
};

// 7 days of 4-hour buckets of entry/exit counts.
const generateEntryExitPoints = (
  entryBase: number,
  exitBase: number
): PeopleInsideSeriesPoint[] => {
  const points: PeopleInsideSeriesPoint[] = [];
  const now = new Date();
  for (let day = 6; day >= 0; day--) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    const dateStr = d.toISOString().slice(0, 10);
    for (let h = 0; h < 24; h += 4) {
      points.push({
        date: dateStr,
        time: `${String(h).padStart(2, "0")}:00`,
        entryCount: waveValue(entryBase, h, day, 0),
        exitCount: waveValue(exitBase, h + 2, day, 1), // exits lag entries slightly
      });
    }
  }
  return points;
};

// One line per zone, 7 days of 4-hour buckets of violation counts.
const generateZoneCountSeries = (
  zones: { zone: string; color: string; dailyValues: number[] }[]
): ZoneCountSeries[] => {
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

// 7 days of 4-hour buckets of meal counts.
const generateCanteenPoints = (): CanteenGraphPoint[] => {
  const points: CanteenGraphPoint[] = [];
  const now = new Date();
  for (let day = 6; day >= 0; day--) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    const dateStr = d.toISOString().slice(0, 10);
    for (let h = 0; h < 24; h += 4) {
      points.push({
        date: dateStr,
        time: `${String(h).padStart(2, "0")}:00`,
        breakfastCount: mealValue(8, h, day, 25),
        lunchCount: mealValue(12, h, day, 40),
        dinnerCount: mealValue(20, h, day, 30),
      });
    }
  }
  return points;
};

// ---------- MOCK DATA (typed as the union) ----------
export const mockOperationalDashboardData: OperationalInsightsDashboardResponse[] = [
  {
    title: "People Count in Factory Premises",
    kpi: {
      title: "People Count in Factory Premises",
      colour: "blue",
      violationsCount: 132,
      lastDetection: "Main Gate",
      lastDetectionTime: "2026-07-08 16:40:56",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: [
          {
            zone: "Main Gate",
            color: DASHBOARD_COLORS.primary,
            data: generateEntryExitPoints(18, 15),
          },
        ],
      },
    },
  },
  {
    title: "Vehicle Count & ANPR at Gates",
    kpi: {
      title: "Vehicle Count & ANPR at Gates",
      colour: "blue",
      violationsCount: 64,
      lastDetection: "Gate 2",
      lastDetectionTime: "2026-07-08 17:12:31",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: [
          {
            zone: "Gate 2",
            color: DASHBOARD_COLORS.primary,
            data: generateEntryExitPoints(10, 9),
          },
        ],
      },
    },
  },
  {
    title: "Canteen Usage Monitoring",
    kpi: {
      title: "Canteen Usage Monitoring",
      colour: "blue",
      violationsCount: 87,
      lastDetection: "Canteen Block A",
      lastDetectionTime: "2026-07-08 13:30:43",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: [{ data: generateCanteenPoints() }],
      },
    },
  },
  {
    title: "Vehicle Unloading / Loading Monitoring",
    kpi: {
      title: "Vehicle Unloading / Loading Monitoring",
      colour: "blue",
      violationsCount: 21,
      lastDetection: "Dock 1",
      lastDetectionTime: "2026-07-08 14:55:18",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: [
          {
            zone: "Dock 1",
            color: DASHBOARD_COLORS.primary,
            data: generateEntryExitPoints(6, 5),
          },
        ],
      },
    },
  },
  {
    title: "Unauthorized Parking / Blocking Aisles",
    kpi: {
      title: "Unauthorized Parking / Blocking Aisles",
      colour: "blue",
      violationsCount: 8,
      lastDetection: "Zone B",
      lastDetectionTime: "2026-07-08 11:47:03",
    },
    graphs: {
      data: {
        granularity: "hour",
        series: generateZoneCountSeries([
          { zone: "Zone A", color: DASHBOARD_COLORS.primary, dailyValues: [2, 3, 1, 2, 4, 1, 2] },
          { zone: "Zone B", color: DASHBOARD_COLORS.warning, dailyValues: [3, 2, 2, 1, 3, 2, 3] },
          { zone: "Zone C", color: DASHBOARD_COLORS.workforce, dailyValues: [1, 1, 2, 2, 1, 0, 1] },
        ]),
      },
    },
  },
];

// ---------- Shifts ----------
export const mockOperationalShifts: ShiftType[] = [
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
