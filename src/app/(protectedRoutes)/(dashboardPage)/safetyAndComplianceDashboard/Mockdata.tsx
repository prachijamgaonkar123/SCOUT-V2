<<<<<<< HEAD
// import { ShiftType, SurveillanceDashboardResponse } from "./SafetyAndComplianceDashboard.types";

// // ---------- Helpers ----------
// const kpi = (
//   title: string,
//   colour: "red" | "green" | "blue" | "gray",
//   violationsCount: number,
//   lastDetection: string,
//   lastDetectionTime: string
// ) => ({
//   title,
//   colour,
//   violationsCount,
//   lastDetection,
//   lastDetectionTime,
// });

// const pieData = (labels: string[], values: number[]) =>
//   labels.map((label, i) => ({
//     label,
//     value: values[i],
//     color: ["#ffcdd2", "#FFEAA7", "#A8E6CF", "#B0E0E6", "#D4A5FF"][i % 5],
//   }));

// // Wave shape across the day: low at night, peaks around midday, plus a small
// // deterministic jitter so lines look like real activity instead of flat steps.
// const waveValue = (base: number, hour: number, day: number, seed: number) => {
//   const wave = Math.sin(((hour - 6) / 24) * Math.PI * 2) + 1; // 0..2, peak ~12:00
//   const jitter = ((day * 7 + hour * 3 + seed * 5) % 3) - 1; // -1..1
//   return Math.max(0, Math.round(base * wave + jitter));
// };

// // Generate hourly series for 7 days (4‑hour intervals)
// const generateSeries = (
//   fields: string[],
//   dailyValues: number[][]
// ) => {
//   const series = [];
//   const now = new Date();
//   for (let day = 6; day >= 0; day--) {
//     const d = new Date(now);
//     d.setDate(d.getDate() - day);
//     const dateStr = d.toISOString().slice(0, 10);
//     for (let h = 0; h < 24; h += 4) {
//       const timeStr = `${String(h).padStart(2, "0")}:00`;
//       const item: any = { date: dateStr, time: timeStr };
//       fields.forEach((field, idx) => {
//         item[field] = waveValue(dailyValues[idx][day], h, day, idx);
//       });
//       series.push(item);
//     }
//   }
//   return series;
// };

// // Generate vehicle points (different structure)
// const generateVehiclePoints = (dailyValues: number[], seed = 0) => {
//   const points = [];
//   const now = new Date();
//   for (let day = 6; day >= 0; day--) {
//     const d = new Date(now);
//     d.setDate(d.getDate() - day);
//     const dateStr = d.toISOString().slice(0, 10);
//     for (let h = 0; h < 24; h += 4) {
//       const timeStr = `${String(h).padStart(2, "0")}:00`;
//       points.push({
//         time: timeStr,
//         date: dateStr,
//         value: waveValue(dailyValues[day], h, day, seed),
//       });
//     }
//   }
//   return points;
// };

// // Hardcoded daily values (7 days)
// const fire = [3, 5, 2, 4, 6, 1, 4];
// const smoke = [2, 4, 1, 3, 5, 2, 3];
// const helmet = [4, 3, 5, 2, 6, 3, 4];
// const vest = [2, 1, 3, 2, 4, 1, 2];
// const glasses = [1, 2, 1, 3, 2, 1, 2];
// const fall = [1, 2, 0, 1, 3, 1, 2];
// const crowd = [2, 1, 3, 0, 2, 1, 2];
// const mob = [1, 0, 2, 0, 1, 0, 1];
// const forklift = [3, 4, 2, 5, 3, 2, 4];
// const vehicle = [1, 2, 0, 3, 1, 2, 1];

// // ---------- MOCK DATA (typed as the union) ----------
// export const mockDashboardData: SurveillanceDashboardResponse[] = [
//   {
//     title: "Fire and Smoke Detection",
//     kpi: kpi("Fire and Smoke Detection", "red", 12, "Zone A", "2026-07-08 14:23:12"),
//     graphs: {
//       data: {
//         granularity: "hour",
//         series: generateSeries(["fireCount", "smokeCount"], [fire, smoke]),
//         hazardTypePieData: pieData(["Fire", "Smoke"], [45, 30]),
//         zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [20, 35, 20]),
//       },
//     },
//   },
//   {
//     title: "PPE Detection (Helmet, Vest, Glasses)",
//     kpi: kpi("PPE Detection (Helmet, Vest, Glasses)", "red", 8, "Zone B", "2026-07-08 13:10:38"),
//     graphs: {
//       data: {
//         granularity: "hour",
//         series: generateSeries(["helmet", "vest", "glasses"], [helmet, vest, glasses]),
//         violationTypePieData: pieData(["No Helmet", "No Vest", "No Glasses"], [25, 15, 8]),
//         zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [18, 22, 12]),
//       },
//     },
//   },
//   {
//     title: "Fall Detection",
//     kpi: kpi("Fall Detection", "red", 5, "Zone C", "2026-07-08 09:45:51"),
//     graphs: {
//       data: {
//         granularity: "hour",
//         series: generateSeries(["count"], [fall]),
//         zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [8, 12, 5]),
//       },
//     },
//   },
//   {
//     title: "Forklift / Vehicle in Walkways",
//     kpi: kpi("Forklift / Vehicle in Walkways", "red", 9, "Zone A", "2026-07-08 16:20:07"),
//     graphs: {
//       data: {
//         granularity: "hour",
//         series: [
//           {
//             label: "Forklift",
//             data: generateVehiclePoints(forklift, 0),
//           },
//           {
//             label: "Vehicle",
//             data: generateVehiclePoints(vehicle, 1),
//           },
//         ],
//         zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [14, 20, 10]),
//       },
//     },
//   },
//   {
//     title: "Crowd Detection in Hazardous Zones",
//     kpi: kpi("Crowd Detection in Hazardous Zones", "red", 3, "Zone B", "2026-07-08 11:30:29"),
//     graphs: {
//       data: {
//         granularity: "hour",
//         series: generateSeries(["count", "mobCount"], [crowd, mob]),
//         zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [6, 9, 4]),
//       },
//     },
//   },
//   {
//     title: "Emergency Exit Blockage Detection",
//     kpi: kpi("Emergency Exit Blockage Detection", "red", 6, "Loading Dock", "2026-07-08 15:05:44"),
//     graphs: {
//       data: {
//         granularity: "hour",
//         barChartData: [
//           { gate: "Main Gate", blocked: 2, clear: 22 },
//           { gate: "Side Exit", blocked: 1, clear: 23 },
//           { gate: "Loading Dock", blocked: 4, clear: 20 },
//           { gate: "Fire Exit A", blocked: 3, clear: 21 },
//           { gate: "Fire Exit B", blocked: 0, clear: 24 },
//         ],
//         zoneWisePieData: pieData(
//           ["Main Gate", "Side Exit", "Loading Dock", "Fire Exit A"],
//           [2, 1, 4, 3]
//         ),
//       },
//     },
//   },
// ];

// // ---------- Shifts ----------
// export const mockShifts: ShiftType[] = [
//   {
//     shiftId: "shift-1",
//     name: "Morning",
//     startTime: "06:00",
//     endTime: "14:00",
//     breakStartTime: "10:00", // dummy
//     breakEndTime: "10:30",   // dummy
//     status: "active",        // dummy
//   },
//   {
//     shiftId: "shift-2",
//     name: "Afternoon",
//     startTime: "14:00",
//     endTime: "22:00",
//     breakStartTime: "18:00",
//     breakEndTime: "18:30",
//     status: "active",
//   },
//   {
//     shiftId: "shift-3",
//     name: "Night",
//     startTime: "22:00",
//     endTime: "06:00",
//     breakStartTime: "02:00",
//     breakEndTime: "02:30",
//     status: "active",
//   },
// ];

// // ---------- Socket payload ----------
// export const mockSocketPayload = {
//   type: "Safety_Dashboard_Update",
//   tenantId: "mock-tenant",
//   serverTimestamp: new Date().toISOString(),
//   data: mockDashboardData,
// };
=======
>>>>>>> a61e6c7 (push scout-v2)
import { ShiftType, SurveillanceDashboardResponse } from "./SafetyAndComplianceDashboard.types";

// ---------- Helpers ----------
const kpi = (
  title: string,
  colour: "red" | "green" | "blue" | "gray",
  violationsCount: number,
  lastDetection: string,
  lastDetectionTime: string
) => ({
  title,
  colour,
  violationsCount,
  lastDetection,
  lastDetectionTime,
});

const pieData = (labels: string[], values: number[]) =>
  labels.map((label, i) => ({
    label,
    value: values[i],
    color: ["#ffcdd2", "#FFEAA7", "#A8E6CF", "#B0E0E6", "#D4A5FF"][i % 5],
  }));

<<<<<<< HEAD
const waveValue = (base: number, hour: number, day: number, seed: number): number => {
  const wave = Math.sin(((hour - 6) / 24) * Math.PI * 2) + 1;
  const jitter = ((day * 7 + hour * 3 + seed * 5) % 3) - 1;
  return Math.max(0, Math.round(base * wave + jitter));
};

// ---------- Generic series generator ----------
// Returns an array of objects with date, time, and any number of numeric fields.
// The exact shape is determined by the caller via type assertion in the mock data.
const generateSeries = (
  fields: string[],
  dailyValues: number[][]
): Array<Record<string, string | number>> => {
  const series: Array<Record<string, string | number>> = [];
=======
// Wave shape across the day: low at night, peaks around midday, plus a small
// deterministic jitter so lines look like real activity instead of flat steps.
const waveValue = (base: number, hour: number, day: number, seed: number) => {
  const wave = Math.sin(((hour - 6) / 24) * Math.PI * 2) + 1; // 0..2, peak ~12:00
  const jitter = ((day * 7 + hour * 3 + seed * 5) % 3) - 1; // -1..1
  return Math.max(0, Math.round(base * wave + jitter));
};

// Generate hourly series for 7 days (4‑hour intervals)
const generateSeries = (
  fields: string[],
  dailyValues: number[][]
) => {
  const series = [];
>>>>>>> a61e6c7 (push scout-v2)
  const now = new Date();
  for (let day = 6; day >= 0; day--) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    const dateStr = d.toISOString().slice(0, 10);
    for (let h = 0; h < 24; h += 4) {
      const timeStr = `${String(h).padStart(2, "0")}:00`;
<<<<<<< HEAD
      const item: Record<string, string | number> = { date: dateStr, time: timeStr };
=======
      const item: any = { date: dateStr, time: timeStr };
>>>>>>> a61e6c7 (push scout-v2)
      fields.forEach((field, idx) => {
        item[field] = waveValue(dailyValues[idx][day], h, day, idx);
      });
      series.push(item);
    }
  }
  return series;
};

// Generate vehicle points (different structure)
const generateVehiclePoints = (dailyValues: number[], seed = 0) => {
<<<<<<< HEAD
  const points: Array<{ time: string; date: string; value: number }> = [];
=======
  const points = [];
>>>>>>> a61e6c7 (push scout-v2)
  const now = new Date();
  for (let day = 6; day >= 0; day--) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    const dateStr = d.toISOString().slice(0, 10);
    for (let h = 0; h < 24; h += 4) {
      const timeStr = `${String(h).padStart(2, "0")}:00`;
      points.push({
        time: timeStr,
        date: dateStr,
        value: waveValue(dailyValues[day], h, day, seed),
      });
    }
  }
  return points;
};

// Hardcoded daily values (7 days)
const fire = [3, 5, 2, 4, 6, 1, 4];
const smoke = [2, 4, 1, 3, 5, 2, 3];
const helmet = [4, 3, 5, 2, 6, 3, 4];
const vest = [2, 1, 3, 2, 4, 1, 2];
const glasses = [1, 2, 1, 3, 2, 1, 2];
const fall = [1, 2, 0, 1, 3, 1, 2];
const crowd = [2, 1, 3, 0, 2, 1, 2];
const mob = [1, 0, 2, 0, 1, 0, 1];
const forklift = [3, 4, 2, 5, 3, 2, 4];
const vehicle = [1, 2, 0, 3, 1, 2, 1];

// ---------- MOCK DATA (typed as the union) ----------
export const mockDashboardData: SurveillanceDashboardResponse[] = [
  {
    title: "Fire and Smoke Detection",
    kpi: kpi("Fire and Smoke Detection", "red", 12, "Zone A", "2026-07-08 14:23:12"),
    graphs: {
      data: {
        granularity: "hour",
<<<<<<< HEAD
        series: generateSeries(["fireCount", "smokeCount"], [fire, smoke]) as Array<{ date: string; time: string; fireCount: number; smokeCount: number }>,
=======
        series: generateSeries(["fireCount", "smokeCount"], [fire, smoke]),
>>>>>>> a61e6c7 (push scout-v2)
        hazardTypePieData: pieData(["Fire", "Smoke"], [45, 30]),
        zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [20, 35, 20]),
      },
    },
  },
  {
    title: "PPE Detection (Helmet, Vest, Glasses)",
    kpi: kpi("PPE Detection (Helmet, Vest, Glasses)", "red", 8, "Zone B", "2026-07-08 13:10:38"),
    graphs: {
      data: {
        granularity: "hour",
<<<<<<< HEAD
        series: generateSeries(["helmet", "vest", "glasses"], [helmet, vest, glasses]) as Array<{ date: string; time: string; helmet: number; vest: number; glasses: number }>,
=======
        series: generateSeries(["helmet", "vest", "glasses"], [helmet, vest, glasses]),
>>>>>>> a61e6c7 (push scout-v2)
        violationTypePieData: pieData(["No Helmet", "No Vest", "No Glasses"], [25, 15, 8]),
        zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [18, 22, 12]),
      },
    },
  },
  {
    title: "Fall Detection",
    kpi: kpi("Fall Detection", "red", 5, "Zone C", "2026-07-08 09:45:51"),
    graphs: {
      data: {
        granularity: "hour",
<<<<<<< HEAD
        series: generateSeries(["count"], [fall]) as Array<{ date: string; time: string; count: number }>,
=======
        series: generateSeries(["count"], [fall]),
>>>>>>> a61e6c7 (push scout-v2)
        zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [8, 12, 5]),
      },
    },
  },
  {
    title: "Forklift / Vehicle in Walkways",
    kpi: kpi("Forklift / Vehicle in Walkways", "red", 9, "Zone A", "2026-07-08 16:20:07"),
    graphs: {
      data: {
        granularity: "hour",
        series: [
          {
            label: "Forklift",
            data: generateVehiclePoints(forklift, 0),
          },
          {
            label: "Vehicle",
            data: generateVehiclePoints(vehicle, 1),
          },
        ],
        zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [14, 20, 10]),
      },
    },
  },
  {
    title: "Crowd Detection in Hazardous Zones",
    kpi: kpi("Crowd Detection in Hazardous Zones", "red", 3, "Zone B", "2026-07-08 11:30:29"),
    graphs: {
      data: {
        granularity: "hour",
<<<<<<< HEAD
        series: generateSeries(["count", "mobCount"], [crowd, mob]) as Array<{ date: string; time: string; count: number; mobCount: number }>,
=======
        series: generateSeries(["count", "mobCount"], [crowd, mob]),
>>>>>>> a61e6c7 (push scout-v2)
        zoneWisePieData: pieData(["Zone A", "Zone B", "Zone C"], [6, 9, 4]),
      },
    },
  },
  {
    title: "Emergency Exit Blockage Detection",
    kpi: kpi("Emergency Exit Blockage Detection", "red", 6, "Loading Dock", "2026-07-08 15:05:44"),
    graphs: {
      data: {
        granularity: "hour",
        barChartData: [
          { gate: "Main Gate", blocked: 2, clear: 22 },
          { gate: "Side Exit", blocked: 1, clear: 23 },
          { gate: "Loading Dock", blocked: 4, clear: 20 },
          { gate: "Fire Exit A", blocked: 3, clear: 21 },
          { gate: "Fire Exit B", blocked: 0, clear: 24 },
        ],
        zoneWisePieData: pieData(
          ["Main Gate", "Side Exit", "Loading Dock", "Fire Exit A"],
          [2, 1, 4, 3]
        ),
      },
    },
  },
];

// ---------- Shifts ----------
export const mockShifts: ShiftType[] = [
  {
    shiftId: "shift-1",
    name: "Morning",
    startTime: "06:00",
    endTime: "14:00",
<<<<<<< HEAD
    breakStartTime: "10:00",
    breakEndTime: "10:30",
    status: "active",
=======
    breakStartTime: "10:00", // dummy
    breakEndTime: "10:30",   // dummy
    status: "active",        // dummy
>>>>>>> a61e6c7 (push scout-v2)
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

// ---------- Socket payload ----------
export const mockSocketPayload = {
  type: "Safety_Dashboard_Update",
  tenantId: "mock-tenant",
  serverTimestamp: new Date().toISOString(),
  data: mockDashboardData,
};