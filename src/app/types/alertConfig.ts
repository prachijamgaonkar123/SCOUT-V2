export type NotificationChannel = "email" | "whatsapp" | "sms";

export interface AlertChannels {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
}

export interface AlertRecipients {
  email: string[];
  whatsapp: string[];
  sms: string[];
}

export type AlertSeverity = "critical" | "warning" | "info";

export type NotifyFrequency = "first_detection" | "every_occurrence" | "interval";

export type ActiveHoursMode = "24_7" | "business_hours" | "custom";

export interface ActiveHours {
  mode: ActiveHoursMode;
  startTime?: string;
  endTime?: string;
}

export interface AlertConfig {
  id?: string;
  usecaseId: string;
  channels: AlertChannels;
  recipients: AlertRecipients;
  severity: AlertSeverity;
  cooldownMinutes: number;
  notifyFrequency: NotifyFrequency;
  activeHours: ActiveHours;
  createdAt?: string;
  updatedAt?: string;
}

/* ---------- User-centric alert subscription model ---------- */

export interface ScoutUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleName: string;
  enabled: boolean;
}

export interface UseCaseCategory {
  id: string;
  name: string;
}

export interface UseCaseSummary {
  id: string;
  name: string;
  categoryId: string;
  /** false when the use case is not part of the organization's subscription */
  available?: boolean;
}

export type NotificationMode = "per_event" | "hourly" | "daily";

export interface UserUseCaseAlertSetting {
  usecaseId: string;
  channels: AlertChannels;
  notificationMode: NotificationMode;
}

export interface UserAlertConfig {
  userId: string;
  subscriptions: UserUseCaseAlertSetting[];
  updatedAt?: string;
}
