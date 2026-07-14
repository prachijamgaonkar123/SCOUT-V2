"use client";

import React, { useState, ReactNode } from "react";
import { Box, Paper } from "@mui/material";
import SegmentedTabBar from "@/app/components/atoms/SegmentedTabBar/SegmentedTabBar";
import { hasFeature } from "@/utils/hasFeature";
// Tab configuration
export interface TabConfig {
  label: string | ReactNode;
  content: ReactNode;
  featureId?: string;
}

interface DynamicTabsProps {
  readonly tabs: TabConfig[];
  readonly defaultTab?: number;
  readonly onTabChange?: (index: number) => void;
  readonly features: string[];
}

// Type-safe props for TabPanel
interface TabPanelProps {
  readonly children: ReactNode;
  readonly value: number;
  readonly index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      aria-labelledby={`tab-${index}`}
      sx={{
        display: value === index ? "flex" : "none",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "auto",
      }}
    >
      {children}
    </Box>
  );
}

export default function DynamicTabs({
  tabs = [],
  defaultTab = 0,
  onTabChange,
  features
}: DynamicTabsProps) {

const firstEnabledIndex = tabs.findIndex(
    (tab) => !tab.featureId || hasFeature(features, tab.featureId)
  );

  const initialTab = firstEnabledIndex >= 0 ? firstEnabledIndex : defaultTab;

  const [value, setValue] = useState(initialTab);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    onTabChange?.(newValue);
  };
  if (!tabs || tabs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        No tabs available
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <SegmentedTabBar
        items={tabs.map((tab, index) => ({
          key: String(index),
          label: tab.label,
          disabled: tab.featureId ? !hasFeature(features, tab.featureId) : false,
          disabledTooltip: "Upgrade your plan to access chart",
        }))}
        activeKey={String(value)}
        onChange={(key) => handleChange(Number(key))}
      />

      <Box
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        {tabs.map((tab, index) => (
          <TabPanel key={index + 1} value={value} index={index}>
            <Paper sx={{ m: 2, flex: 1, minHeight: 0, minWidth: 0 }}>
              {tab.content}
            </Paper>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
