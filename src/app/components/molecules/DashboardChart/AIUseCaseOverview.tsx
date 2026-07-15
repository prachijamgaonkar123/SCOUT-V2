"use client";
import React from "react";
import { Box, Card, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

export interface AIUseCaseOverviewDatum {
  label: string;
  value: number;
  color: string;
}

export interface AIUseCaseOverviewProps {
  title?: string;
  subtitle?: string;
  data: AIUseCaseOverviewDatum[];
  centerLabel?: string;
}

/** Mirrors the mockup's "AI Use Case Overview" card — donut + legend list. */
const AIUseCaseOverview: React.FC<AIUseCaseOverviewProps> = ({
  title = "AI Use Case Overview",
  subtitle = "Share of total detections by use case category, today",
  data,
  centerLabel = "Total Detections",
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
        border: `1px solid ${DASHBOARD_COLORS.border}`,
        borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
      }}
    >
      <Box sx={{ flexShrink: 0, padding: "16px 20px 2px 20px" }}>
        <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
          {title}
        </Typography>
        <Typography
          sx={{ fontSize: "11.5px", color: DASHBOARD_COLORS.textSecondary, fontWeight: 500, mt: "2px" }}
        >
          {subtitle}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "stretch", gap: "18px", padding: "4px 20px 14px 20px", flex: 1, minHeight: 0 }}>
        {/* Donut is a square that tracks the card's full height (capped),
            so it grows on taller/full-HD viewports instead of sitting small
            inside a much taller card. */}
        <Box sx={{ position: "relative", height: "100%", aspectRatio: "1", maxWidth: 220, alignSelf: "stretch", flexShrink: 0, containerType: "size" }}>
          <PieChart
            series={[
              {
                data: data.map((d) => ({ id: d.label, value: d.value, label: d.label, color: d.color })),
                innerRadius: "68%",
                outerRadius: "100%",
                paddingAngle: 0,
                cornerRadius: 0,
              },
            ]}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            hideLegend
            sx={{ "& path": { stroke: "#fff", strokeWidth: 3 } }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Typography sx={{ fontSize: "clamp(20px, 8cqh, 30px)", fontWeight: 800, color: DASHBOARD_COLORS.textPrimary, lineHeight: 1 }}>
              {total}
            </Typography>
            <Typography sx={{ fontSize: "clamp(9px, 3cqh, 12px)", fontWeight: 600, color: DASHBOARD_COLORS.textSecondary, mt: "2px" }}>
              {centerLabel}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignSelf: "stretch", gap: "9px" }}>
          {data.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                <Box
                  component="span"
                  sx={{ width: 9, height: 9, borderRadius: "3px", flexShrink: 0, backgroundColor: item.color }}
                />
                <Typography sx={{ color: DASHBOARD_COLORS.textPrimary, fontWeight: 600, flex: 1, fontSize: "12.5px" }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontWeight: 800, color: DASHBOARD_COLORS.textPrimary, fontSize: "12.5px" }}>
                  {item.value}
                </Typography>
                <Typography
                  sx={{ color: DASHBOARD_COLORS.textSecondary, fontWeight: 600, width: 34, textAlign: "right", fontSize: "12.5px" }}
                >
                  {pct}%
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
};

export default AIUseCaseOverview;
