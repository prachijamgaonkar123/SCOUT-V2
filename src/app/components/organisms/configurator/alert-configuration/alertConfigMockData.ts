import {
  ScoutUser,
  UseCaseCategory,
  UseCaseSummary,
  UserAlertConfig,
  NotificationMode,
} from "@/app/types/alertConfig";

export const mockCategories: UseCaseCategory[] = [
  { id: "cat-safety", name: "Safety & Compliance" },
  { id: "cat-security", name: "Surveillance Monitoring" },
  { id: "cat-workforce", name: "Workforce Monitoring" },
  { id: "cat-operational", name: "Operational Insight" },
];

export const mockUseCases: UseCaseSummary[] = [
  { id: "uc-ppe", name: "PPE Compliance Detection", categoryId: "cat-safety" },
  { id: "uc-fire-smoke", name: "Fire & Smoke Detection", categoryId: "cat-safety" },
  { id: "uc-fall", name: "Person Fall Detection", categoryId: "cat-safety" },
  { id: "uc-forklift", name: "Vehicle in Pedestrian Walkway Detection", categoryId: "cat-safety" },
  { id: "uc-exit-blockage", name: "Emergency Exit Obstruction Detection", categoryId: "cat-safety" },
  { id: "uc-crowd", name: "Crowd Detection in Hazardous Areas", categoryId: "cat-safety" },

  { id: "uc-intrusion", name: "Perimeter Intrusion Detection", categoryId: "cat-security" },
  { id: "uc-shutdown-movement", name: "Shutdown Period Activity Detection", categoryId: "cat-security" },
  { id: "uc-restricted-access", name: "Restricted Area Access Detection", categoryId: "cat-security" },

  { id: "uc-idle-time", name: "Employee Idle Time Monitoring", categoryId: "cat-workforce" },
  { id: "uc-presence-critical", name: "Critical Area Occupancy Monitoring", categoryId: "cat-workforce" },
  { id: "uc-presence-restricted", name: "Restricted Area Occupancy Monitoring", categoryId: "cat-workforce" },
  { id: "uc-mobile-usage", name: "Mobile Phone Usage Detection", categoryId: "cat-workforce" },
  { id: "uc-guard-sleeping", name: "Security Guard Alertness Monitoring", categoryId: "cat-workforce" },

  { id: "uc-vehicle-anpr", name: "Vehicle Counting & ANPR", categoryId: "cat-operational" },
  { id: "uc-canteen", name: "Canteen Occupancy Monitoring", categoryId: "cat-operational" },
  { id: "uc-vehicle-loading", name: "Loading & Unloading Activity Monitoring", categoryId: "cat-operational" },
  { id: "uc-unauth-parking", name: "Unauthorized Parking Detection", categoryId: "cat-operational" },
];

export const mockUsers: ScoutUser[] = [
  { id: "user-1", firstName: "John", lastName: "Carter", email: "john.carter@company.com", phone: "+91 90000 00001", roleName: "Admin", enabled: true },
  { id: "user-2", firstName: "Sarah", lastName: "Miller", email: "sarah.miller@company.com", phone: "+91 90000 00002", roleName: "Safety Manager", enabled: true },
  { id: "user-3", firstName: "Rahul", lastName: "Sharma", email: "rahul.sharma@company.com", phone: "+91 90000 00003", roleName: "Supervisor", enabled: true },
  { id: "user-4", firstName: "Priya", lastName: "Verma", email: "priya.verma@company.com", phone: "+91 90000 00004", roleName: "Security Officer", enabled: false },
  { id: "user-5", firstName: "Amit", lastName: "Patel", email: "amit.patel@company.com", phone: "+91 90000 00005", roleName: "Operator", enabled: true },
  { id: "user-6", firstName: "Neha", lastName: "Singh", email: "neha.singh@company.com", phone: "+91 90000 00006", roleName: "Supervisor", enabled: true },
  { id: "user-7", firstName: "Vikram", lastName: "Rao", email: "vikram.rao@company.com", phone: "+91 90000 00007", roleName: "Safety Manager", enabled: true },
  { id: "user-8", firstName: "Ananya", lastName: "Iyer", email: "ananya.iyer@company.com", phone: "+91 90000 00008", roleName: "Operator", enabled: true },
];

const channels = (email: boolean, whatsapp: boolean, sms: boolean) => ({ email, whatsapp, sms });

const sub = (
  usecaseId: string,
  channelValues: { email: boolean; whatsapp: boolean; sms: boolean },
  notificationMode: NotificationMode = "per_event"
) => ({ usecaseId, channels: channelValues, notificationMode });

export const mockUserAlertConfigs: UserAlertConfig[] = [
  {
    userId: "user-1",
    updatedAt: "2026-07-01",
    subscriptions: [
      sub("uc-ppe", channels(true, true, false), "per_event"),
      sub("uc-fire-smoke", channels(true, true, false), "per_event"),
      sub("uc-fall", channels(true, false, false), "per_event"),
      sub("uc-intrusion", channels(true, true, false), "hourly"),
      sub("uc-guard-sleeping", channels(true, false, false), "per_event"),
      sub("uc-idle-time", channels(true, true, false), "daily"),
      sub("uc-vehicle-anpr", channels(true, true, false), "hourly"),
    ],
  },
  {
    userId: "user-2",
    updatedAt: "2026-06-24",
    subscriptions: [
      sub("uc-ppe", channels(true, false, false), "per_event"),
      sub("uc-fire-smoke", channels(true, false, false), "per_event"),
      sub("uc-fall", channels(true, false, false), "per_event"),
      sub("uc-exit-blockage", channels(true, false, false), "per_event"),
      sub("uc-crowd", channels(true, false, false), "hourly"),
    ],
  },
  {
    userId: "user-3",
    updatedAt: "2026-07-05",
    subscriptions: [
      sub("uc-ppe", channels(true, true, true), "per_event"),
      sub("uc-fire-smoke", channels(true, true, false), "per_event"),
      sub("uc-fall", channels(true, false, true), "per_event"),
      sub("uc-forklift", channels(true, true, false), "hourly"),
      sub("uc-intrusion", channels(true, true, true), "per_event"),
      sub("uc-shutdown-movement", channels(true, false, true), "per_event"),
      sub("uc-guard-sleeping", channels(true, true, false), "per_event"),
      sub("uc-unauth-parking", channels(true, false, false), "hourly"),
      sub("uc-idle-time", channels(true, true, false), "daily"),
      sub("uc-presence-critical", channels(true, false, true), "per_event"),
      sub("uc-vehicle-anpr", channels(true, true, true), "hourly"),
    ],
  },
  {
    userId: "user-4",
    updatedAt: "2026-06-30",
    subscriptions: [
      sub("uc-intrusion", channels(true, true, false), "per_event"),
      sub("uc-shutdown-movement", channels(true, false, false), "per_event"),
      sub("uc-guard-sleeping", channels(true, true, false), "per_event"),
      sub("uc-unauth-parking", channels(true, false, false), "hourly"),
    ],
  },
  {
    userId: "user-6",
    updatedAt: "2026-06-18",
    subscriptions: [
      sub("uc-idle-time", channels(true, false, false), "daily"),
      sub("uc-presence-restricted", channels(true, false, false), "daily"),
      sub("uc-mobile-usage", channels(true, false, false), "per_event"),
    ],
  },
];
