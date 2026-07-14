"use client";
import React from "react";
import SegmentedTabBar from "@/app/components/atoms/SegmentedTabBar/SegmentedTabBar";
import { UseCaseCategory } from "@/app/config/dashboardTheme";

export interface UseCaseTab {
  key: UseCaseCategory;
  label: string;
}

export interface UseCaseTabsProps {
  tabs: UseCaseTab[];
  active: UseCaseCategory;
  onChange: (key: UseCaseCategory) => void;
}

/** Category filter for the AI Use Cases Status grid — renders via the same
 * SegmentedTabBar used by DashboardTabs on the Monitoring pages. */
const UseCaseTabs: React.FC<UseCaseTabsProps> = ({ tabs, active, onChange }) => (
  <SegmentedTabBar
    items={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}
    activeKey={active}
    onChange={(key) => onChange(key as UseCaseCategory)}
  />
);

export default UseCaseTabs;
