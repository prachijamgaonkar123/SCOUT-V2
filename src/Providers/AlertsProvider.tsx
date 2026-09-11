"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertStatus } from "@/app/components/molecules/AlertsTable/AlertsTable";
import { mockAlerts, toPopupEvent } from "@/app/(protectedRoutes)/alertsPage/AlertsMockData";
import type { SecurityAlertEvent } from "@/app/components/molecules/MiniDropdown/Types";

interface AlertsContextValue {
  alerts: Alert[];
  popupEvents: SecurityAlertEvent[];
  /** True while the popup is snoozed — the popup is hidden even though
   * popupEvents is non-empty. */
  isPopupSnoozed: boolean;
  handleStatusChange: (alert: Alert, status: AlertStatus, note?: string) => void;
  handlePopupStatusChange: (
    eventId: string,
    status: "acknowledged" | "resolved",
    note?: string,
  ) => Promise<void>;
  /** Hides the popup for the given number of minutes without touching the
   * underlying alert data — mirrors the reference "Snooze" control. */
  handleSnoozePopup: (minutes: number) => void;
  /** Turns snooze off immediately — mirrors the reference table-header switch. */
  clearSnooze: () => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

// Lives above the alerts page (wraps the whole protected layout) so the
// popup can render on any page, not just the Alerts page itself. Mirrors
// the reference UI: the popup shows automatically whenever there are new
// alerts and is dismissed per-alert (acknowledge/resolve) or snoozed for a
// fixed duration — there is no header bell toggle.
export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [isPopupSnoozed, setIsPopupSnoozed] = useState(false);
  const snoozeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const popupEvents = useMemo(
    () => alerts.filter((alert) => alert.status === "new").map((alert) => toPopupEvent(alert)),
    [alerts],
  );

  const handleStatusChange = (alert: Alert, status: AlertStatus, note?: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status, ...(note ? { notes: note } : {}) } : a)),
    );
  };

  const handlePopupStatusChange = async (
    eventId: string,
    status: "acknowledged" | "resolved",
    note?: string,
  ): Promise<void> => {
    const alert = alerts.find((a) => a.id === eventId);
    if (!alert) return;
    handleStatusChange(alert, status, note);
  };

  const handleSnoozePopup = (minutes: number) => {
    setSnoozeUntil(Date.now() + minutes * 60_000);
    setIsPopupSnoozed(true);
  };

  const clearSnooze = () => {
    setSnoozeUntil(null);
    setIsPopupSnoozed(false);
  };

  // Single one-shot timer that un-snoozes the popup once the chosen
  // duration elapses, instead of polling on an interval.
  useEffect(() => {
    if (snoozeTimerRef.current) {
      clearTimeout(snoozeTimerRef.current);
      snoozeTimerRef.current = null;
    }

    if (!snoozeUntil) return;

    const remainingMs = snoozeUntil - Date.now();
    if (remainingMs <= 0) {
      setIsPopupSnoozed(false);
      return;
    }

    snoozeTimerRef.current = setTimeout(() => {
      setIsPopupSnoozed(false);
    }, remainingMs);

    return () => {
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    };
  }, [snoozeUntil]);

  const value: AlertsContextValue = {
    alerts,
    popupEvents,
    isPopupSnoozed,
    handleStatusChange,
    handlePopupStatusChange,
    handleSnoozePopup,
    clearSnooze,
  };

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts(): AlertsContextValue {
  const ctx = useContext(AlertsContext);
  if (!ctx) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return ctx;
}
