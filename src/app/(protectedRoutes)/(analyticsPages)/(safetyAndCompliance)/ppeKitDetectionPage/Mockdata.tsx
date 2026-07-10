// Mockdata.ts
import { KpiItem, ZoneViolationInteface, PPEViolation, DetailedReportResponse } from './PPEKitDetection.types';

// ---------- KPI ----------
export const mockPpeKpi: KpiItem[] = [
  { title: 'Total Violations', value: 42, colour: 'red' },
  { title: 'Current Unsafe Zone', value: 'Zone A', colour: 'blue' },
  { title: 'Last Detection Time', value: '2026-07-10 14:30:00', colour: 'blue' },
  { title: 'Missing Helmet', value: 12, colour: 'red' },
  { title: 'Missing Vest', value: 8, colour: 'red' },
  { title: 'Missing Glasses', value: 22, colour: 'red' },
];

// ---------- Zone Violations ----------
export const mockZoneViolations: ZoneViolationInteface[] = [
  {
    zone: 'Zone A',
    violations: 15,
    subViolations: [
      { label: 'Helmet', value: 6 },
      { label: 'Vest', value: 4 },
      { label: 'Glasses', value: 5 },
    ],
  },
  {
    zone: 'Zone B',
    violations: 10,
    subViolations: [
      { label: 'Helmet', value: 3 },
      { label: 'Vest', value: 2 },
      { label: 'Glasses', value: 5 },
    ],
  },
  
];

// ---------- Recent Violations ----------
export const mockRecentViolations: PPEViolation[] = [
  {
    voilation: 'Hard hat missing',
    zone: 'Zone A',
    time: '2026-07-10T14:32:10Z',
    imageUrl: '/images/violation1.jpg',
    incident: 'Worker without helmet',
    cameraId: 'CAM-01',
    alarmTriggered: true,
  },
  {
    voilation: 'Safety vest not worn',
    zone: 'Zone B',
    time: '2026-07-10T14:28:45Z',
    imageUrl: '/images/violation2.jpg',
    incident: 'Worker without vest',
    cameraId: 'CAM-02',
    alarmTriggered: false,
  },
  {
    voilation: 'Safety glasses missing',
    zone: 'Zone C',
    time: '2026-07-10T14:20:30Z',
    imageUrl: '/images/violation3.jpg',
    incident: 'Worker without glasses',
    cameraId: 'CAM-03',
    alarmTriggered: true,
  },
  {
    voilation: 'Hard hat missing',
    zone: 'Zone A',
    time: '2026-07-10T14:15:00Z',
    imageUrl: '/images/violation4.jpg',
    incident: 'Worker without helmet',
    cameraId: 'CAM-01',
    alarmTriggered: true,
  },
  {
    voilation: 'Safety vest not worn',
    zone: 'Zone B',
    time: '2026-07-10T14:05:20Z',
    imageUrl: '/images/violation5.jpg',
    incident: 'Worker without vest',
    cameraId: 'CAM-02',
    alarmTriggered: false,
  },
  {
    voilation: 'Safety glasses missing',
    zone: 'Zone C',
    time: '2026-07-10T13:55:10Z',
    imageUrl: '/images/violation6.jpg',
    incident: 'Worker without glasses',
    cameraId: 'CAM-03',
    alarmTriggered: true,
  },
  {
    voilation: 'Hard hat missing',
    zone: 'Zone A',
    time: '2026-07-10T13:40:55Z',
    imageUrl: '/images/violation7.jpg',
    incident: 'Worker without helmet',
    cameraId: 'CAM-01',
    alarmTriggered: false,
  },
  {
    voilation: 'Safety vest not worn',
    zone: 'Zone B',
    time: '2026-07-10T13:30:40Z',
    imageUrl: '/images/violation8.jpg',
    incident: 'Worker without vest',
    cameraId: 'CAM-02',
    alarmTriggered: true,
  },
];

// ---------- Detailed Report ----------
export const mockDetailedReport: DetailedReportResponse = {
  data: mockRecentViolations,
  zones: ['Zone A', 'Zone B', 'Zone C'],
  cameras: ['CAM-01', 'CAM-02', 'CAM-03'],
};