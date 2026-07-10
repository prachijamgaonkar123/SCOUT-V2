"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { DASHBOARD_COLORS, MuiIcon } from "@/app/config/dashboardTheme";

export type BreakdownTone = "red" | "info";

const TONE_STYLES: Record<BreakdownTone, { bg: string; color: string }> = {
  red: { bg: DASHBOARD_COLORS.errorTint, color: DASHBOARD_COLORS.error },
  info: { bg: DASHBOARD_COLORS.accentTint, color: DASHBOARD_COLORS.accent },
};

export interface BreakdownMetric {
  icon: MuiIcon;
  value: string | number;
  label: string;
  /** Icon tint — defaults to "red". Use "info" for neutral facts like a zone name or timestamp. */
  tone?: BreakdownTone;
  /** Override the value's font size (px) — useful for long strings like timestamps. */
  valueFontSize?: number;
}

export interface ViolationBreakdownProps {
  title?: string;
  /** Flexible metric list so this card can be reused across pages with different data. */
  metrics: BreakdownMetric[];
}

/** Content only — no card chrome, so the caller can place this inside its own card/layout. */
const ViolationBreakdown: React.FC<ViolationBreakdownProps> = ({
  title = "Violation Breakdown",
  metrics,
}) => {
  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "18px" }}>
        <ChecklistIcon sx={{ fontSize: 17, color: DASHBOARD_COLORS.secondary }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "12px",
          rowGap: "22px",
        }}
      >
        {metrics.map((metric, index) => {
          const { bg, color } = TONE_STYLES[metric.tone ?? "red"];
          const Icon = metric.icon;
          return (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  backgroundColor: bg,
                  color,
                }}
              >
                <Icon sx={{ fontSize: 16 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: metric.valueFontSize ?? 16,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: DASHBOARD_COLORS.textPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: DASHBOARD_COLORS.textSecondary,
                    mt: "2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {metric.label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ViolationBreakdown;
