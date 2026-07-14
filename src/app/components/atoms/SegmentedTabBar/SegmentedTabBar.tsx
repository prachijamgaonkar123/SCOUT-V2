"use client";
import React, { ReactNode } from "react";
import { Box, Tooltip } from "@mui/material";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

export interface SegmentedTabItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
}

export interface SegmentedTabBarProps {
  items: SegmentedTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

/** Single source of truth for the segmented-capsule tab bar look used by both
 * the Dashboard page's category filter (UseCaseTabs) and the Monitoring pages'
 * tab bar (DashboardTabs) — keeps them from drifting apart visually. */
const SegmentedTabBar: React.FC<SegmentedTabBarProps> = ({ items, activeKey, onChange }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
      overflowX: "auto",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
      backgroundColor: DASHBOARD_COLORS.bg,
      borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
      borderRadius: "12px 12px 0 0",
      padding: "6px 8px 0 8px",
    }}
  >
    {items.map((item, index) => {
      const isActive = item.key === activeKey;
      const button = (
        <Box
          component="button"
          disabled={item.disabled}
          onClick={() => !item.disabled && onChange(item.key)}
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "28px",
            padding: "4px 18px",
            background: "none",
            border: "none",
            borderRadius: "999px",
            flexShrink: 0,
            whiteSpace: "nowrap",
            backgroundColor: isActive ? DASHBOARD_COLORS.secondary : "transparent",
            boxShadow: isActive ? "0 1px 3px rgba(37, 99, 235, 0.3)" : "none",
            color: isActive ? "#fff" : DASHBOARD_COLORS.textSecondary,
            fontSize: "13px",
            fontWeight: isActive ? 700 : 600,
            fontFamily: "inherit",
            opacity: item.disabled ? 0.4 : 1,
            cursor: item.disabled ? "default" : "pointer",
            pointerEvents: item.disabled ? "none" : "auto",
            transition: "background-color .15s ease, color .15s ease",
            "&:hover": !isActive && !item.disabled
              ? { backgroundColor: DASHBOARD_COLORS.hover, color: DASHBOARD_COLORS.textPrimary }
              : undefined,
          }}
        >
          {item.label}
        </Box>
      );

      return (
        <React.Fragment key={item.key}>
          {item.disabled && item.disabledTooltip ? (
            <Tooltip title={item.disabledTooltip} arrow placement="top">
              <span style={{ display: "inline-block", pointerEvents: "auto" }}>{button}</span>
            </Tooltip>
          ) : (
            button
          )}
          {index < items.length - 1 && (
            <Box
              sx={{
                width: "1px",
                height: "14px",
                backgroundColor: DASHBOARD_COLORS.border,
                mx: "4px",
                flexShrink: 0,
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);

export default SegmentedTabBar;
