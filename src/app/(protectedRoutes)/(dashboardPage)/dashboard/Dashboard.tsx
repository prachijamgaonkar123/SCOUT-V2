

"use client";

import React, { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  CheckCircleOutline,
  VideocamOffOutlined,
  ReportProblemOutlined,
  QueryStatsOutlined,

  AppsOutlined,
  BoltOutlined,

  LocalShippingOutlined,

  HourglassBottomOutlined,
  RestaurantOutlined,
  DoorFrontOutlined,
  SensorsOutlined,

  BlockOutlined,
} from "@mui/icons-material";

import StatCard from "@/app/components/molecules/DashboardKpiCardMain/StatCard";
import AIUseCaseOverview from "@/app/components/molecules/DashboardChart/AIUseCaseOverview";
import DetectionTrendChart from "@/app/components/molecules/DashboardChart/DetectionTrendChart";
import EventCard, { EventSeverity } from "@/app/components/molecules/DashboardRecentEvent/EventCard";
import UseCaseTabs from "@/app/components/molecules/DashboardAIUseCasesSection/UseCaseTabs";
import UseCaseGrid, { UseCaseGridItem } from "@/app/components/molecules/DashboardAIUseCasesSection/UseCaseGrid";
import UpgradeBanner from "@/app/components/molecules/UpgradeBanner/UpgradeBanner";
import CameraOnlineOfflinePopUp, {
  CameraListItem,
} from "@/app/components/molecules/cameraOnlineOfflinePopUp/cameraOnlineOfflinePopUp";
import { CATEGORY_LABEL, DASHBOARD_COLORS, MuiIcon, UseCaseCategory } from "@/app/config/dashboardTheme";
import { analyticsMenu, LinkMenuItem } from "@/app/config/menuConfig";
import { FEATURE_ICON } from "@/app/config/featureIcons";
import { hasFeature } from "@/utils/hasFeature";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";   // <-- added

// Import the route config
import { MainDashboardConfig } from "./DashboardConfig"; // adjust path as needed

const DONUT_DATA = [
  { label: "Safety & Compliance", value: 58, color: DASHBOARD_COLORS.primary },
  { label: "Surveillance Monitoring", value: 42, color: DASHBOARD_COLORS.success },
  { label: "Operational Insights", value: 26, color: DASHBOARD_COLORS.warning },
  { label: "Workforce Monitoring", value: 17, color: DASHBOARD_COLORS.workforce },
];

const TREND_CATEGORIES = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

const TREND_SERIES = [
  { label: "Safety & Compliance", color: DASHBOARD_COLORS.primary, data: [1, 1, 0, 1, 1, 2, 4, 7, 9, 8, 7, 8, 9, 7, 6, 5, 6, 7, 5, 3, 2, 2, 1, 1] },
  { label: "Surveillance Monitoring", color: DASHBOARD_COLORS.success, data: [3, 3, 2, 2, 3, 2, 2, 2, 3, 3, 4, 4, 4, 4, 4, 3, 3, 3, 4, 5, 5, 4, 3, 3] },
  { label: "Operational Insights", color: DASHBOARD_COLORS.warning, data: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 3, 6, 7, 5, 3, 2, 2, 3, 1, 1, 0, 0, 0, 0] },
  { label: "Workforce Monitoring", color: DASHBOARD_COLORS.workforce, data: [0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 0, 0, 0, 0, 0] },
];

/** Maps analyticsMenu's category titles to our 4 dashboard tabs (Facial
 *  Recognition Analytics isn't part of this donut/trend breakdown yet). */
const CATEGORY_TITLE_TO_KEY: Record<string, UseCaseCategory> = {
  "Safety & Compliance": "safety",
  "Surveillance Monitoring": "surveillance",
  "Operational Insight": "operational",
  "Workforce Monitoring": "workforce",
};

/** Full display name + demo count per featureId — real counts will come from
 *  the detections API once it's wired up; paths/icons below are already
 *  sourced from the real analyticsMenu config, not invented. */
const STATUS_META: Record<string, { name: string; value: number }> = {
  SUC001: { name: "PPE Detection (Helmet, Vest, Gloves, Mask)", value: 5 },
  SUC002: { name: "Fire and Smoke Detection", value: 8 },
  SUC003: { name: "Fall Detection", value: 9 },
  SUC004: { name: "Forklift / Vehicle in Walkways", value: 8 },
  SUC005: { name: "Emergency Exit Blockage Detection", value: 9 },
  SUC006: { name: "Crowd Detection in Hazardous Zones", value: 8 },
  SUC007: { name: "Intrusion Detection at Perimeter", value: 4 },
  SUC010: { name: "Movement During Shutdown Hours", value: 8 },
  SUC008: { name: "Unauthorized Access in Restricted Areas", value: 8 },
  SUC009: { name: "Camera Tampering Detection", value: 6 },
  SUC016: { name: "People Count in Factory Premises", value: 25 },
  SUC017: { name: "Vehicle Count & ANPR at Gates", value: 6 },
  SUC018: { name: "Canteen Usage Monitoring", value: 21 },
  SUC019: { name: "Vehicle Unloading / Loading Monitoring", value: 2 },
  SUC020: { name: "Unauthorized Parking / Blocking Aisles", value: 4 },
  SUC013: { name: "Employee Idle Time Monitoring", value: 2 },
  SUC011: { name: "Employee Presence in Critical Areas", value: 7 },
  SUC012: { name: "Employee Presence in Restricted Areas", value: 3 },
  SUC014: { name: "Mobile Phone Usage in Restricted Zones", value: 3 },
  SUC015: { name: "Sleeping / Absence of Security Guards", value: 2 },
};

// -------- NEW: Map display titles to routes (from MainDashboardConfig) --------
const ROUTE_MAP: Record<string, string> = {
  "PPE Detection (Helmet, Vest, Gloves, Mask)": MainDashboardConfig["PPE Violations"]?.route,
  "Fire and Smoke Detection": MainDashboardConfig["Fire & Smoke Alerts"]?.route,
  "Fall Detection": MainDashboardConfig["Fall / Laydown Alerts"]?.route,
  "Forklift / Vehicle in Walkways": MainDashboardConfig["Vehicle In Walkways"]?.route,
  "Emergency Exit Blockage Detection": MainDashboardConfig["Emergency Exit Blockage"]?.route,
  "Crowd Detection in Hazardous Zones": MainDashboardConfig["Crowd Gathering Alerts"]?.route,
  "Intrusion Detection at Perimeter": MainDashboardConfig["Intrusion Detection"]?.route,
  "Movement During Shutdown Hours": MainDashboardConfig["Movement During Shutdown"]?.route,
  "Unauthorized Access in Restricted Areas": MainDashboardConfig["Unauthorized Access In Restricted Areas"]?.route,
  "Camera Tampering Detection": MainDashboardConfig["Camera Tampering Detection"]?.route,
  "People Count in Factory Premises": MainDashboardConfig["People Count"]?.route,
  "Vehicle Count & ANPR at Gates": MainDashboardConfig["Vehicle Count"]?.route,
  "Canteen Usage Monitoring": MainDashboardConfig["Canteen Usage Monitoring"]?.route,
  "Vehicle Unloading / Loading Monitoring": MainDashboardConfig["Vehicle Loading/Unloading Monitoring"]?.route,
  "Unauthorized Parking / Blocking Aisles": MainDashboardConfig["Unauthorised Parking / Blocking Aisles"]?.route,
  "Employee Idle Time Monitoring": MainDashboardConfig["Employee Idle Time"]?.route,
  "Employee Presence in Critical Areas": MainDashboardConfig["Employee in Critical Area"]?.route,
  "Employee Presence in Restricted Areas": MainDashboardConfig["Employee in Restricted Area"]?.route,
  "Mobile Phone Usage in Restricted Zones": MainDashboardConfig["Mobile Phone Usage in Critical Area"]?.route,
  "Sleeping / Absence of Security Guards": MainDashboardConfig["Sleeping / Absence of Security Personnel"]?.route,
};
// ---------------------------------------------------------------------------

function useStatusItems(): UseCaseGridItem[] {
  const features = useSelector((state: RootState) => state.auth.features);

  return useMemo(
    () =>
      analyticsMenu.flatMap((category): UseCaseGridItem[] => {
        const key = CATEGORY_TITLE_TO_KEY[category.title];
        if (!key) return [];

        return category.items.filter((item): item is LinkMenuItem => item.type === "link").map((item) => {
          const meta = item.featureId ? STATUS_META[item.featureId] : undefined;
          return {
            icon: (item.featureId && FEATURE_ICON[item.featureId]) || AppsOutlined,
            category: key,
            title: meta?.name ?? item.name,
            value: meta?.value,
            locked: !hasFeature(features, item.featureId),
          };
        });
      }),
    [features],
  );
}

const RECENT_EVENTS: { severity: EventSeverity; icon: MuiIcon; title: string; meta: string; time: string }[] = [
  { severity: "critical", icon: BlockOutlined, title: "Employee Presence in Restricted Areas", meta: "Zone A · CAM-07", time: "2 min ago" },
  { severity: "critical", icon: SensorsOutlined, title: "Intrusion Detection at Perimeter", meta: "Zone C · CAM-14", time: "4 min ago" },
  { severity: "warning", icon: DoorFrontOutlined, title: "Emergency Exit Blockage Detection", meta: "Zone A · CAM-01", time: "6 min ago" },
  { severity: "warning", icon: LocalShippingOutlined, title: "Forklift / Vehicle in Walkways", meta: "Zone B · CAM-09", time: "9 min ago" },
  { severity: "info", icon: RestaurantOutlined, title: "Canteen Usage Monitoring", meta: "Zone A · CAM-03", time: "12 min ago" },
  { severity: "warning", icon: HourglassBottomOutlined, title: "Employee Idle Time Monitoring", meta: "Zone B · CAM-11", time: "18 min ago" },
];

/** Demo camera lists for the online/offline stat card popups — real data
 *  will come from the camera status API once it's wired up. */
const ONLINE_CAMERAS: CameraListItem[] = Array.from({ length: 118 }, (_, i) => ({
  id: `CAM-${String(i + 1).padStart(3, "0")}`,
  zone: `Zone ${String.fromCharCode(65 + (i % 4))}`,
  status: "online",
}));

const OFFLINE_CAMERAS: CameraListItem[] = [
  { id: "CAM-045", zone: "Zone B", status: "offline" },
  { id: "CAM-092", zone: "Zone C", status: "offline" },
];

const TAMPERED_CAMERAS: CameraListItem[] = [
  { id: "CAM-013", zone: "Zone A", status: "tampered" },
  { id: "CAM-077", zone: "Zone D", status: "tampered" },
  { id: "CAM-101", zone: "Zone B", status: "tampered" },
];

const CATEGORY_TABS: { key: UseCaseCategory; label: string }[] = (
  ["safety", "surveillance", "operational", "workforce"] as UseCaseCategory[]
).map((key) => ({ key, label: CATEGORY_LABEL[key] }));

const Dashboard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UseCaseCategory>("safety");
  const [cameraPopup, setCameraPopup] = useState<"online" | "offline" | null>(null);
  const statusItems = useStatusItems();
  const router = useRouter();   // <-- added

  const filteredUseCases = useMemo(() => {
    const categoryItems = statusItems.filter((item) => item.category === activeCategory);
    // Surveillance Monitoring only has 3 active use cases — add a blank filler
    // tile so the row doesn't look lopsided next to the other 3-wide categories.
    if (activeCategory === "surveillance") {
      return [
        ...categoryItems,
        { icon: AppsOutlined, category: "surveillance", title: "", empty: true } as UseCaseGridItem,
      ];
    }
    return categoryItems;
  }, [statusItems, activeCategory]);

  // -------- NEW: Click handler for UseCaseGrid items --------
  const handleUseCaseClick = (item: UseCaseGridItem) => {
    // If locked, optionally show a message or do nothing
    if (item.locked) {
      // You could add a toast or snackbar here
      return;
    }

    const route = ROUTE_MAP[item.title];
    if (route) {
      router.push(route);
    } else {
      // Optionally log or notify that no route is configured
      console.warn(`No route found for "${item.title}"`);
    }
  };
  // ---------------------------------------------------------

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* 5 KPI cards */}
      <Box
        sx={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" },
          gap: "14px",
        }}
      >
        <StatCard icon={CheckCircleOutline} tone="green" value={115} total=" /120" label="Cameras Online" onClick={() => setCameraPopup("online")} />
        <StatCard icon={VideocamOffOutlined} tone="red" value={5} label="Cameras Offline" onClick={() => setCameraPopup("offline")} />
        <StatCard icon={ReportProblemOutlined} tone="amber" value={12} label="Open Incidents"  onClick={() => router.push('/alertsPage')} hideArrow />
        <StatCard icon={QueryStatsOutlined} tone="blue" value={143} label="Total Detections Today" onClick={() => router.push('/alertsPage')} hideArrow />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            padding: "14px",
            border: `1.5px solid ${DASHBOARD_COLORS.border}`,
            borderRadius: "12px",
            backgroundColor: "#F0F2F5",
            cursor: "default",
            boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
          }}
        >
          {/* No value, no label */}
        </Box>
      </Box>

      {/* AI Use Case Overview | Detections Trend | Recent Events (spans both rows) | AI Use Cases Status. */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", gap: "12px" }}>
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Charts prefer 280px, shrink to 176px on short viewports and grow up to 360px on tall ones; leftover beyond that goes to the status card */}
          <Box sx={{ flexGrow: 1, flexShrink: 1, flexBasis: 280, minHeight: 176, maxHeight: 360, display: "flex", gap: "12px" }}>
            <AIUseCaseOverview data={DONUT_DATA} />
            <DetectionTrendChart categories={TREND_CATEGORIES} series={TREND_SERIES} />
          </Box>

          {/* AI Use Cases Status — absorbs whatever the capped charts can't */}
          <Box
            sx={{
              flexGrow: 1,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: DASHBOARD_COLORS.card,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
            }}
          >
            <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "9px", padding: "12px 20px 0 20px" }}>
              <AppsOutlined sx={{ fontSize: 19, color: DASHBOARD_COLORS.secondary }} />
              <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>AI Use Cases Status</Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <UseCaseTabs tabs={CATEGORY_TABS} active={activeCategory} onChange={setActiveCategory} />
            </Box>
            <Box sx={{ flexGrow: 1, padding: "8px 16px 12px 16px" }}>
              {/* Pass the click handler to UseCaseGrid */}
              <UseCaseGrid items={filteredUseCases} onItemClick={handleUseCaseClick} />
            </Box>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <UpgradeBanner
              title="1 more AI use cases available with an upgrade"
              subtitle="Unlock advanced detection models across every zone."
            />
          </Box>
        </Box>

        {/* Recent Events — stretches to the row height, which the left column dictates */}
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            alignSelf: "stretch",
            position: "relative",
            backgroundColor: DASHBOARD_COLORS.card,
            border: `1px solid ${DASHBOARD_COLORS.border}`,
            borderRadius: "12px",
            boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
            overflow: "hidden",
          }}
        >
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 8px 24px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <BoltOutlined sx={{ fontSize: 19, color: DASHBOARD_COLORS.secondary }} />
              <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>Recent Events</Typography>
            </Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "10.5px",
                fontWeight: 700,
                color: DASHBOARD_COLORS.success,
                "&::before": {
                  content: '""',
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: DASHBOARD_COLORS.success,
                },
              }}
            >
              Live
            </Box>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "2px 20px 16px 20px" }}>
            {/* {RECENT_EVENTS.map((event, index) => (
              <EventCard
                key={`${event.title}-${index}`}
                severity={event.severity}
                icon={event.icon}
                title={event.title}
                meta={event.meta}
                time={event.time}
              />
            ))} */}
            {RECENT_EVENTS.map((event, index) => (
                <Box
                  key={`${event.title}-${index}`}
                  onClick={() => router.push('/alertsPage')}
                  sx={{ cursor: 'pointer' }}
                >
                  <EventCard
                    severity={event.severity}
                    icon={event.icon}
                    title={event.title}
                    meta={event.meta}
                    time={event.time}
                  />
                </Box>
              ))}
          </Box>
        </Box>
        </Box>
      </Box>

      <CameraOnlineOfflinePopUp
        open={cameraPopup !== null}
        onClose={() => setCameraPopup(null)}
        title={
          cameraPopup === "online"
            ? `Cameras Online (${ONLINE_CAMERAS.length})`
            : `Cameras Offline (${OFFLINE_CAMERAS.length + TAMPERED_CAMERAS.length})`
        }
        sections={
          cameraPopup === "online"
            ? [{ label: "Online", status: "online", cameras: ONLINE_CAMERAS }]
            : [
                { label: "Offline", status: "offline", cameras: OFFLINE_CAMERAS },
                { label: "Tampered", status: "tampered", cameras: TAMPERED_CAMERAS },
              ]
        }
      />
    </Box>
  );
};

export default Dashboard;