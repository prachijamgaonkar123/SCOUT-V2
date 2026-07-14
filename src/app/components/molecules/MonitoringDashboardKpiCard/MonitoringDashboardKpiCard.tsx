
"use client";
import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { Lock } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { DASHBOARD_COLORS, MuiIcon } from "@/app/config/dashboardTheme";
import { StatCardTone, TONE_STYLES } from "../DashboardKpiCardMain/StatCard";

export interface DashboardKpiCardProps {
  title: string;
  violationsCount: number;
  lastDetection: string;
  lastDetectionTime: string;
  route?: string;
  icon: MuiIcon;               // now uses the same icon type as StatCard
  tooltipMessage?: string;
  tone?: StatCardTone;         // "red" | "green" | "blue" | "gray" | "amber"
  colour?: StatCardTone;       // legacy alias for tone (older dashboards)
  total?: string;              // optional, like StatCard's total
}

const DashboardKpiCard: React.FC<DashboardKpiCardProps> = ({
  title,
  violationsCount,
  lastDetection,
  lastDetectionTime,
  icon: Icon,
  route,
  tooltipMessage,
  tone,
  colour,
  total,
}) => {
  const router = useRouter();
  const resolvedTone: StatCardTone = tone ?? colour ?? "gray";
  const { bg, color } = TONE_STYLES[resolvedTone] ?? TONE_STYLES.gray;
  const clickable = !!route && resolvedTone !== "gray";
  const isGray = resolvedTone === "gray";
  const isEmpty = (v: string) => !v || v === "-" || v === "—";
  const hasDetection = !isEmpty(lastDetection) || !isEmpty(lastDetectionTime);

  return (
    <Tooltip
      title={isGray ? `Upgrade your plan to access ${title}` : tooltipMessage ?? ""}
      arrow
      placement="top"
      enterDelay={isGray ? 0 : 400}
    >
    <Box
      onClick={() => {
        if (clickable) router.push(route!);
      }}
      sx={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: DASHBOARD_COLORS.card,
        border: `1px solid ${DASHBOARD_COLORS.border}`,
        borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
        p: "10px 12px",
        cursor: clickable ? "pointer" : "default",
        transition: "box-shadow .12s ease, transform .12s ease",
        // Left accent bar (tone colored)
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          backgroundColor: color,
        },
        ...(clickable && {
          "&:hover": {
            boxShadow: "0 4px 10px rgba(0,0,0,.10)",
            transform: "translateY(-1px)",
          },
        }),
        opacity: isGray ? 0.7 : 1,
      }}
    >
      {/* Row 1: icon + title left, value right */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
        <Box
          sx={{
            width: 28,
            height: 28,
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

        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: 1.25,
            color: isGray ? DASHBOARD_COLORS.textSecondary : color,
          }}
        >
          {title}
        </Typography>

        {isGray ? (
          <Lock
            sx={{
              fontSize: 17,
              color: DASHBOARD_COLORS.textSecondary,
              flexShrink: 0,
            }}
          />
        ) : (
          <Typography
            sx={{
              fontSize: "21px",
              fontWeight: 800,
              letterSpacing: "-.02em",
              lineHeight: 1,
              color: DASHBOARD_COLORS.textPrimary,
              flexShrink: 0,
            }}
          >
            {violationsCount}
            {total && (
              <Typography
                component="span"
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: DASHBOARD_COLORS.textSecondary,
                  ml: 0.5,
                }}
              >
                {total}
              </Typography>
            )}
          </Typography>
        )}

      </Box>

      {/* Row 2: single detail line (kept invisible on gray cards so height matches) */}
      <Typography
        sx={{
          fontSize: "11px",
          color: DASHBOARD_COLORS.textSecondary,
          mt: "6px",
          visibility: isGray ? "hidden" : "visible",
        }}
      >
        last detection:{" "}
        {hasDetection ? (
          <>
            <Box component="span" sx={{ fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
              {lastDetection}
            </Box>
            {" · "}
            <Box component="span" sx={{ fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
              {lastDetectionTime}
            </Box>
          </>
        ) : (
          <Box component="span" sx={{ fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
            —
          </Box>
        )}
      </Typography>
    </Box>
    </Tooltip>
  );
};

export default DashboardKpiCard;