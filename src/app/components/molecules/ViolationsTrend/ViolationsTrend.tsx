"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { LineChart } from "@mui/x-charts/LineChart";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

export interface TrendDataPoint {
  date: string; // e.g., "Jun 25"
  value: number;
}

export interface ViolationsTrendProps {
  title?: string;
  data: TrendDataPoint[];
  /** Signed percentage change vs. the previous period, e.g. 18 or -12. */
  trendPercentage: number;
  /** Line/area color — defaults to the dashboard's error red. */
  color?: string;
}

/** Content only — no card chrome, so the caller can place this inside its own card/layout. */
const ViolationsTrend: React.FC<ViolationsTrendProps> = ({
  title = "Violations Trend (7 Days)",
  data,
  trendPercentage,
  color = DASHBOARD_COLORS.error,
}) => {
  // More violations (upward trend) is bad → red badge; fewer is good → green badge.
  const isUp = trendPercentage >= 0;
  const ArrowIcon = isUp ? ArrowUpwardIcon : ArrowDownwardIcon;
  const badgeBg = isUp ? DASHBOARD_COLORS.errorTint : DASHBOARD_COLORS.successTint;
  const badgeColor = isUp ? DASHBOARD_COLORS.error : DASHBOARD_COLORS.success;

  const xLabels = data.map((d) => d.date);
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "14px" }}>
        <TrendingUpIcon sx={{ fontSize: 17, color: DASHBOARD_COLORS.secondary }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
          {title}
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "20px",
            backgroundColor: badgeBg,
            color: badgeColor,
          }}
        >
          <ArrowIcon sx={{ fontSize: 12 }} />
          {Math.abs(trendPercentage)}%
        </Box>
      </Box>

      {/* No fixed height — on desktop this stretches to match ViolationBreakdown's
          natural content height via the parent flex row (default align-items: stretch).
          On mobile there's no sibling to stretch against, so it falls back to a
          viewport-relative floor instead of a hardcoded pixel value.
          The chart itself is absolutely positioned to fill this box exactly —
          LineChart's own auto-height detection doesn't reliably pick up a
          flex-stretched ancestor's height, which was leaving blank space below
          the x-axis labels instead of the chart filling the available room. */}
      <Box sx={{ flex: 1, minWidth: 0, minHeight: { xs: "22vh", md: 0 }, position: "relative" }}>
        <LineChart
          skipAnimation
          series={[
            {
              data: values,
              color,
              area: true,
              showMark: true,
              curve: "natural",
            },
          ]}
          xAxis={[
            {
              scaleType: "point",
              data: xLabels,
              tickLabelStyle: { fontSize: 10.5, fill: DASHBOARD_COLORS.textSecondary },
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: maxValue + Math.ceil(maxValue * 0.2),
              tickLabelStyle: { fontSize: 10.5, fill: DASHBOARD_COLORS.textSecondary },
              width: 24,
            },
          ]}
          grid={{ horizontal: true }}
          // Right margin needs room for the last tick label's right half — the point
          // scale places the last dot flush at the plot's right edge, so its centered
          // date label overflows past a small margin and gets clipped by the card's
          // overflow:hidden (that's the "J..." truncation).
          margin={{ left: 8, right: 24, top: 10, bottom: 24 }}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            "& .MuiAreaElement-root": {
              fillOpacity: 0.08,
            },
            "& .MuiLineElement-root": {
              strokeWidth: 2.5,
            },
            "& .MuiMarkElement-root": {
              stroke: color,
              fill: color,
              r: 3,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ViolationsTrend;
