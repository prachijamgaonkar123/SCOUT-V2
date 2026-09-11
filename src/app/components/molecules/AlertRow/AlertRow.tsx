"use client";

import { useState, type FC } from "react";

import styles from "../AlertPopup/RecentEventPopup.module.css";

import type { SecurityAlertEvent } from "../MiniDropdown/Types";

import {
  CameraIcon,
  ChevronDownIcon,
  ClockIcon,
  PinIcon,
} from "../MiniDropdown/Icons";

import ThumbnailFrame from "../MiniDropdown/ThumbnailFrame";

const SEVERITY_BADGE_CLASS: Record<SecurityAlertEvent["severity"], string> = {
  critical: styles.sevCritical,
  "non-critical": styles.sevWarning,
};

const SEVERITY_LABEL: Record<SecurityAlertEvent["severity"], string> = {
  critical: "Critical",
  "non-critical": "Non-Critical",
};

const SEVERITY_BAR_CLASS: Record<SecurityAlertEvent["severity"], string> = {
  critical: styles.barCritical,
  "non-critical": styles.barWarning,
};

interface AlertRowProps {
  event: SecurityAlertEvent;

  isExpanded: boolean;

  onToggleExpand: () => void;

  onStatusChange?: (
    eventId: string,
    status: "acknowledged" | "resolved",
    note: string,
  ) => Promise<void>;

  currentTime: number;
}

/**
 * Parse API timestamp.
 *
 * API format:
 * DD:MM:YYYY HH:mm:ss
 *
 * Example:
 * 31:08:2026 10:00:00
 */
const parseAlertDate = (timestamp: string): number => {
  const match = timestamp.match(
    /^(\d{2}):(\d{2}):(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return NaN;
  }

  const [, day, month, year, hours, minutes, seconds] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
  ).getTime();
};

/**
 * Calculate how long ago the violation occurred.
 */
const getAlertAge = (timestamp: string, currentTime: number): string => {
  const eventTime = parseAlertDate(timestamp);

  if (!Number.isFinite(eventTime)) {
    return "";
  }

  const elapsedMilliseconds = Math.max(0, currentTime - eventTime);

  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds} sec ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMinutes = elapsedMinutes % 60;

  if (elapsedHours < 24) {
    if (remainingMinutes === 0) {
      return `${elapsedHours} hr ago`;
    }

    return `${elapsedHours} hr ${remainingMinutes} min ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays < 30) {
    return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
  }

  const elapsedMonths = Math.floor(elapsedDays / 30);

  return `${elapsedMonths} month${elapsedMonths === 1 ? "" : "s"} ago`;
};

const AlertRow: FC<AlertRowProps> = ({
  event,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  currentTime,
}) => {
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [note, setNote] = useState(event.notes ?? "");

  const isCritical = event.severity === "critical";

  const canAcknowledge = isCritical && event.status === "new";

  const canResolve = !isCritical && event.status === "new";

  const alertAge = getAlertAge(event.timestamp, currentTime);

  // const handleStatusChange = async (): Promise<void> => {
  //   if (!onStatusChange || isStatusUpdating) {
  //     return;
  //   }

  //   const nextStatus: "acknowledged" | "resolved" | null = canAcknowledge
  //     ? "acknowledged"
  //     : canResolve
  //       ? "resolved"
  //       : null;

  //   if (!nextStatus) {
  //     return;
  //   }

  //   setIsStatusUpdating(true);

  //   try {
  //     await onStatusChange(event.id, nextStatus);
  //   } catch (error) {
  //     console.error(
  //       `Failed to update alert ${event.id} status to ${nextStatus}:`,
  //       error,
  //     );
  //   } finally {
  //     setIsStatusUpdating(false);
  //   }
  // };

  const handleStatusChange = async (): Promise<void> => {
    if (!onStatusChange || isStatusUpdating) {
      return;
    }

    const nextStatus: "acknowledged" | "resolved" | null = canAcknowledge
      ? "acknowledged"
      : canResolve
        ? "resolved"
        : null;

    if (!nextStatus) {
      return;
    }

    setIsStatusUpdating(true);

    try {
      await onStatusChange(event.id, nextStatus, note);
    } catch (error) {
      console.error(
        `Failed to update alert ${event.id} status to ${nextStatus}:`,
        error,
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  return (
    <div
      className={`${styles.alertRow} ${isExpanded ? styles.alertRowOpen : ""}`}
    >
      <div
        className={`${styles.alertRowBar} ${
          SEVERITY_BAR_CLASS[event.severity]
        }`}
      />

      {/* =====================================================
          ALERT HEADER
          ===================================================== */}

      <button
        type="button"
        className={styles.alertRowMain}
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
      >
        <div className={styles.camIconBadge}>
          {event.category ? (
            <CameraIcon className={styles.icon} />
          ) : (
            <CameraIcon className={styles.icon} />
          )}
        </div>

        <div className={styles.alertRowMid}>
          <div className={styles.alertRowTitle}>
            <span className={styles.name}>{event.alertType}</span>

            <span className={styles.catTag}>{event.category}</span>
          </div>

          <div className={styles.alertRowMeta}>
            <span>
              <CameraIcon className={styles.icon} />
              {event.camera}
            </span>

            <span>
              <PinIcon className={styles.icon} />
              {event.zone}
            </span>

            <span>
              <ClockIcon className={styles.icon} />
              {event.timestamp}
            </span>
          </div>
        </div>

        <div className={styles.alertRowRight}>
          <span
            className={`${styles.sevBadge} ${
              SEVERITY_BADGE_CLASS[event.severity]
            }`}
          >
            <span className={styles.sevDot} />

            {SEVERITY_LABEL[event.severity]}
          </span>

          <ChevronDownIcon
            className={`${styles.chevron} ${
              isExpanded ? styles.chevronOpen : ""
            }`}
          />
        </div>
      </button>

      {/* =====================================================
          EXPANDED ALERT
          ===================================================== */}

      <div className={styles.alertExpand}>
        <div className={styles.alertExpandInner}>
          {/* IMAGE */}
          <ThumbnailFrame
            imageUrl={event.imageUrl}
            imageFileName={event.imageFileName}
            isRecording={event.isRecording}
            alt={`Camera snapshot for ${event.alertType} at ${event.camera}`}
          />

          {/* DETAILS */}
          <div className={styles.alertDetails}>
            {/* =================================================
                TIME SINCE DETECTION
                ================================================= */}

            {alertAge && (
              <div className={styles.alertTime}>
                <span className={styles.alertTimeLabel}>
                  Time Since Detection
                </span>

                <span className={styles.alertTimeValue}>{alertAge}</span>
              </div>
            )}

            {/* =================================================
                NOTE INPUT
                ================================================= */}

            <div className={styles.noteContainer}>
              <label
                htmlFor={`alert-note-${event.id}`}
                className={styles.noteLabel}
              >
                Note
              </label>

              <textarea
                id={`alert-note-${event.id}`}
                value={note}
                onChange={(inputEvent) => setNote(inputEvent.target.value)}
                onClick={(inputEvent) => inputEvent.stopPropagation()}
                onKeyDown={(inputEvent) => inputEvent.stopPropagation()}
                placeholder="Add a note..."
                className={styles.noteInput}
                maxLength={200}
              />
            </div>

            {/* =================================================
                STATUS ACTION
                ================================================= */}

            {(canAcknowledge || canResolve) && (
              <div className={styles.statusActionContainer}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleStatusChange();
                  }}
                  disabled={!onStatusChange || isStatusUpdating}
                  className={
                    isCritical ? styles.acknowledgeButton : styles.resolveButton
                  }
                >
                  {isStatusUpdating
                    ? canAcknowledge
                      ? "Acknowledging..."
                      : "Resolving..."
                    : canAcknowledge
                      ? "Acknowledge"
                      : "Resolve"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertRow;
