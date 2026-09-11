"use client";

import { useEffect, useMemo, useState, type FC } from "react";

import styles from "./RecentEventPopup.module.css";

import type { RecentEventPopupProps } from "../MiniDropdown/Types";
import AlertRow from "../AlertRow/AlertRow";
import SnoozeControl from "./SnoozeControl";

interface RecentEventPopupPropsWithStatus extends RecentEventPopupProps {
  onStatusChange: (
    eventId: string,
    status: "acknowledged" | "resolved",
    note: string,
  ) => Promise<void>;
  /** Hides the popup for the chosen number of minutes without touching the
   * underlying alert data. */
  onSnooze: (minutes: number) => void;
}

const RecentEventPopup: FC<RecentEventPopupPropsWithStatus> = ({
  events,
  tenantLabel,
  totalCount,
  defaultExpandedEventIds,
  onToggleRow,
  onStatusChange,
  onSnooze,
  className,
}) => {
  const resolvedTotalCount = totalCount ?? events.length;

  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const initialExpandedIds = useMemo<Set<string>>(() => {
    const ids = defaultExpandedEventIds ?? (events[0] ? [events[0].id] : []);

    return new Set(ids);
  }, [defaultExpandedEventIds, events]);

  const [expandedIds, setExpandedIds] =
    useState<Set<string>>(initialExpandedIds);

  const handleToggleRow = (eventId: string): void => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      const willExpand = !next.has(eventId);

      if (willExpand) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }

      onToggleRow?.(eventId, willExpand);

      return next;
    });
  };

  return (
    <div className={[styles.overlay, className].filter(Boolean).join(" ")}>
      <div className={styles.console}>
        <div className={styles.popupArea}>
          <div className={styles.popup}>
            <div className={styles.toolbar}>
              <h4>Active Alerts</h4>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className={styles.cnt}>
                  {events.length} of {resolvedTotalCount} shown
                </span>
                <SnoozeControl onSnooze={onSnooze} />
              </div>
            </div>

            <div className={styles.eventsContainer}>
              {events.map((event) => (
                <AlertRow
                  key={event.id}
                  event={event}
                  isExpanded={expandedIds.has(event.id)}
                  onToggleExpand={() => handleToggleRow(event.id)}
                  onStatusChange={onStatusChange}
                  currentTime={currentTime}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentEventPopup;
