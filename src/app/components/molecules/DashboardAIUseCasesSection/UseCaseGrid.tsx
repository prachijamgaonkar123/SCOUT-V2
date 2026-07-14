"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { CATEGORY_COLOR, CATEGORY_TINT, DASHBOARD_COLORS, MuiIcon, UseCaseCategory } from "@/app/config/dashboardTheme";
import UseCaseCard from "./UseCaseCard";

export interface UseCaseGridItem {
  icon: MuiIcon;
  category: UseCaseCategory;
  title: string;
  value?: number;
  locked?: boolean;
  empty?: boolean;
}

export interface UseCaseGridProps {
  items: UseCaseGridItem[];
  onItemClick?: (item: UseCaseGridItem) => void;
  onLockedClick?: (item: UseCaseGridItem) => void;
}

/** Mirrors the mockup's `.status-grid-inner` — 3-col grid of AI Use Case Status tiles. */
const UseCaseGrid: React.FC<UseCaseGridProps> = ({ items, onItemClick, onLockedClick }) => {
  if (items.length === 0) {
    return (
      <Typography
        sx={{ textAlign: "center", padding: "30px", color: DASHBOARD_COLORS.textSecondary, fontSize: "12.5px" }}
      >
        No active use cases in this category yet.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        gridAutoRows: "1fr",
        height: "100%",
        gap: "12px",
      }}
    >
      {items.map((item, index) => (
        <UseCaseCard
          key={item.empty ? `empty-${index}` : item.title}
          icon={item.icon}
          title={item.title}
          value={item.value}
          locked={item.locked}
          empty={item.empty}
          accentColor={CATEGORY_COLOR[item.category]}
          accentTint={CATEGORY_TINT[item.category]}
          onClick={() => (item.locked ? onLockedClick?.(item) : onItemClick?.(item))}
        />
      ))}
    </Box>
  );
};

export default UseCaseGrid;
