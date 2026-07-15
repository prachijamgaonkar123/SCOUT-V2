"use client";
import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { DASHBOARD_COLORS, MuiIcon } from "@/app/config/dashboardTheme";

export type StatCardTone = "green" | "red" | "amber" | "blue" | "gray";

export const TONE_STYLES: Record<StatCardTone, { bg: string; color: string }> = {
  green: { bg: DASHBOARD_COLORS.successTint, color: DASHBOARD_COLORS.success },
  red: { bg: DASHBOARD_COLORS.errorTint, color: DASHBOARD_COLORS.error },
  amber: { bg: DASHBOARD_COLORS.warningTint, color: DASHBOARD_COLORS.warningText },
  blue: { bg: DASHBOARD_COLORS.primaryTint, color: DASHBOARD_COLORS.primary },
  gray: { bg: DASHBOARD_COLORS.gray, color: DASHBOARD_COLORS.grayText },
};

export interface StatCardProps {
  icon: MuiIcon;
  tone: StatCardTone;
  value: string | number;
  total?: string;
  label: string;
  onClick?: () => void;
  hideArrow?: boolean; // <-- ADD THIS
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  tone,
  value,
  total,
  label,
  onClick,
  hideArrow = false, // <-- default to false
}) => {
  const theme = useTheme();
  // Full HD / large external monitors are >=1536px (MUI "xl"); MacBook screens
  // are almost always narrower than that in CSS px, so this naturally splits
  // "Mac" vs "Full HD" without any manual override.
  const isFullHD = useMediaQuery(theme.breakpoints.up("xl"));

  const { bg, color } = TONE_STYLES[tone];
  const clickable = !!onClick;

  const iconBadge = (
    <Box
      sx={{
        width: isFullHD ? 40 : 38,
        height: isFullHD ? 40 : 38,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: bg,
        color,
      }}
    >
      <Icon sx={{ fontSize: 20 }} />
    </Box>
  );

  const chevron =
    clickable && !hideArrow ? (
      <ChevronRight
        className="stat-card-chevron"
        sx={{
          fontSize: isFullHD ? 20 : 18,
          color: "#9CA3AF",
          flexShrink: 0,
          transition: "color .12s ease",
        }}
      />
    ) : null;

  const hoverSx = clickable
    ? {
        "&:hover": {
          boxShadow: "0 4px 10px rgba(0,0,0,.10)",
          transform: "translateY(-1px)",
          "& .stat-card-chevron": { color: DASHBOARD_COLORS.secondary },
        },
      }
    : {};

  // ---- Full HD: vertical layout — icon+chevron header row, value, label ----
  if (isFullHD) {
    return (
      <Box
        onClick={onClick}
        sx={{
          backgroundColor: DASHBOARD_COLORS.card,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
          borderRadius: "12px",
          boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          cursor: clickable ? "pointer" : "default",
          transition: "box-shadow .12s ease, transform .12s ease",
          ...hoverSx,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px" }}>
          {iconBadge}
          {chevron}
        </Box>

        <Typography
          sx={{
            fontSize: "26px",
            fontWeight: 800,
            letterSpacing: "-.02em",
            lineHeight: 1,
            color: DASHBOARD_COLORS.textPrimary,
          }}
        >
          {value}
          {total && (
            <Typography
              component="span"
              sx={{ fontSize: "14px", fontWeight: 600, color: DASHBOARD_COLORS.textSecondary }}
            >
              {total}
            </Typography>
          )}
        </Typography>

        <Typography
          sx={{ fontSize: "13px", color: DASHBOARD_COLORS.textSecondary, fontWeight: 600, mt: "4px" }}
        >
          {label}
        </Typography>
      </Box>
    );
  }

  // ---- Mac / smaller screens: original compact horizontal layout ----
  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: DASHBOARD_COLORS.card,
        border: `1px solid ${DASHBOARD_COLORS.border}`,
        borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: clickable ? "pointer" : "default",
        transition: "box-shadow .12s ease, transform .12s ease",
        ...hoverSx,
      }}
    >
      {iconBadge}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-.02em",
            lineHeight: 1,
            color: DASHBOARD_COLORS.textPrimary,
          }}
        >
          {value}
          {total && (
            <Typography
              component="span"
              sx={{ fontSize: "13px", fontWeight: 600, color: DASHBOARD_COLORS.textSecondary }}
            >
              {total}
            </Typography>
          )}
        </Typography>
        <Typography
          sx={{ fontSize: "12px", color: DASHBOARD_COLORS.textSecondary, fontWeight: 600, mt: "3px" }}
        >
          {label}
        </Typography>
      </Box>

      {chevron}
    </Box>
  );
};

export default StatCard;