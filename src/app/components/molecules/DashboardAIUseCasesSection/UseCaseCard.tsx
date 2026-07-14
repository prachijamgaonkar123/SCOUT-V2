"use client";
import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { Lock } from "@mui/icons-material";
import { DASHBOARD_COLORS, MuiIcon } from "@/app/config/dashboardTheme";

export interface UseCaseCardProps {
  icon: MuiIcon;
  title: string;
  value?: number;
  /** Category accent used for the border + icon tint on unlocked cards. */
  accentColor?: string;
  accentTint?: string;
  locked?: boolean;
  /** Blank filler tile — no icon/title/value/lock, just a gray placeholder to
   * round out the grid when a category has fewer real use cases than columns. */
  empty?: boolean;
  onClick?: () => void;
}

/** Mirrors the mockup's `.status-tile` — a single AI Use Case Status tile (+ locked/upgrade variant). */
const UseCaseCard: React.FC<UseCaseCardProps> = ({
  icon: Icon,
  title,
  value,
  accentColor = DASHBOARD_COLORS.primary,
  accentTint = DASHBOARD_COLORS.primaryTint,
  locked = false,
  empty = false,
  onClick,
}) => {
  if (empty) {
    return (
      <Box
        sx={{
          border: `1.5px solid ${DASHBOARD_COLORS.border}`,
          borderRadius: "10px",
          backgroundColor: DASHBOARD_COLORS.bg,
        }}
      />
    );
  }

  if (locked) {
    return (
      <Tooltip title={`Upgrade your plan to access ${title}`} arrow placement="top">
      <Box
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          padding: "14px",
          border: `1.5px dashed ${DASHBOARD_COLORS.border}`,
          borderRadius: "10px",
          backgroundColor: DASHBOARD_COLORS.bg,
          cursor: "pointer",
          transition: "border-color .12s ease",
          "&:hover": { borderColor: "#C7CFDA" },
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            backgroundColor: DASHBOARD_COLORS.hover,
            color: DASHBOARD_COLORS.textSecondary,
          }}
        >
          <Icon sx={{ fontSize: 17 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 700,
              color: DASHBOARD_COLORS.textSecondary,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
        </Box>
        <Lock sx={{ fontSize: 17, color: DASHBOARD_COLORS.textSecondary, flexShrink: 0 }} />
      </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "14px",
        border: `1.5px solid ${accentColor}`,
        borderRadius: "10px",
        cursor: "pointer",
        transition: "box-shadow .12s ease",
        "&:hover": { boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)" },
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          backgroundColor: accentTint,
          color: accentColor,
        }}
      >
        <Icon sx={{ fontSize: 17 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            color: DASHBOARD_COLORS.textPrimary,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
      </Box>
      {value !== undefined && (
        <Typography sx={{ fontSize: "18px", fontWeight: 800, color: DASHBOARD_COLORS.textPrimary, flexShrink: 0 }}>
          {value}
        </Typography>
      )}
    </Box>
  );
};

export default UseCaseCard;
