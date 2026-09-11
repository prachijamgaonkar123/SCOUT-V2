"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RecentEventPopup.module.css";

const SNOOZE_OPTIONS = [
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
];

interface SnoozeControlProps {
  onSnooze: (minutes: number) => void;
}

export default function SnoozeControl({ onSnooze }: SnoozeControlProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={[
        styles.miniDropdown,
        open ? styles.miniDropdownOpen : "",
      ].join(" ")}
      ref={rootRef}
    >
      <button
        type="button"
        className={styles.miniDropdownTrigger}
        onClick={() => setOpen((prev) => !prev)}
      >
        Snooze
        <span aria-hidden>▾</span>
      </button>

      <div className={styles.miniDropdownList}>
        {SNOOZE_OPTIONS.map((option) => (
          <div
            key={option.minutes}
            className={styles.miniDropdownItem}
            onClick={() => {
              onSnooze(option.minutes);
              setOpen(false);
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
