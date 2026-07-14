"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { WorkspacePremiumOutlined } from "@mui/icons-material";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

export interface UpgradeBannerProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onUpgrade?: () => void;
}

/** Mirrors the mockup's `.upgrade-banner` — promo strip below the AI Use Cases Status card. */
const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  title,
  subtitle,
  buttonLabel = "View Plans",
  onUpgrade,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "10px 16px",
      background: "linear-gradient(135deg, #F5F7FF 0%, #EEF2FB 100%)",
      border: "1px solid #DCE4FA",
      borderRadius: "12px",
      flexWrap: "wrap",
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "10px",
        backgroundColor: "#fff",
        border: "1px solid #DCE4FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: DASHBOARD_COLORS.primary,
        flexShrink: 0,
      }}
    >
      <WorkspacePremiumOutlined sx={{ fontSize: 20 }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "11.5px",
          color: DASHBOARD_COLORS.textSecondary,
          mt: "3px",
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
    <Button
      variant="contained"
      onClick={onUpgrade}
      sx={{
        flexShrink: 0,
        backgroundColor: DASHBOARD_COLORS.primary,
        "&:hover": { backgroundColor: DASHBOARD_COLORS.primaryDark },
        textTransform: "none",
        fontWeight: 600,
        fontSize: "13.5px",
        borderRadius: "8px",
        px: "18px",
      }}
    >
      {buttonLabel}
    </Button>
  </Box>
);

export default UpgradeBanner;
