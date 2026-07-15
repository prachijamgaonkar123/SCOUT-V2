

"use client";
/**
 * Sidebar — Scout Vision (pixel-matched to the approved HTML mockup)
 * ─────────────────────────────────────────────────────────────────────────
 * Every size/color/spacing token below is copied 1:1 from the mockup CSS
 * (.sidebar, .nav-item, .nav-sub, .nav-group-label, .nav-badge, …).
 * See the "M" token object — do not tweak values inline; change them there.
 *
 * Behaviour kept from the previous production sidebar:
 * • 100% menuConfig-driven (no hardcoded nav items)
 * • Feature gating via useAuth() + hasFeature() → tooltip + lock badge
 * • Route-aware: owning section auto-opens on navigation, still manually
 *   collapsible afterwards
 * • Collapse-to-rail (72px) persisted in localStorage, matching the
 *   mockup's .sidebar.collapsed rules (labels/subs/footer hidden)
 * • alertCount prop overrides the static badge in menuConfig
 *
 * Matching the mockup exactly also means:
 * • Monitoring / Analytics / Settings behave as an accordion — opening one
 *   section automatically closes the others (Analytics categories already
 *   followed this rule; the top-level sections now match).
 * • Analytics categories render as uppercase micro-labels (.nav-group-label)
 *   inside the Analytics sub-list, with their items directly below —
 *   exactly the flat look of the mockup, while still following menuConfig.
 * • Labels WRAP instead of truncating — nothing overlaps or hides.
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Tooltip,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  BarChart,
  ExpandMore,
  Settings as SettingsIcon,
  Lock,
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
  InsightsOutlined as InsightsOutlinedIcon,
  VideoCallOutlined as VideoCallOutlinedIcon,
  WarningAmberOutlined as WarningAmberOutlinedIcon,
  SpaceDashboardOutlined as SpaceDashboardOutlinedIcon,
  TuneOutlined as TuneOutlinedIcon,
} from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material/SvgIcon";

import {
  dashboardMenu,
  alertMenu,
  analyticsMenu,
  settingsMenu,
  // liveStreamingMenu,
  MenuItemConfig,
  LinkMenuItem,
  GroupMenuItem,
} from "../../../config/menuConfig";
import { FEATURE } from "../../../config/featureRegistry";
import { FEATURE_ICON } from "../../../config/featureIcons";
import { useAuth } from "@/customhooks/useAuth";
import { hasFeature } from "@/utils/hasFeature";
import { useGetOrgAndUserLogoQuery } from "@/app/(protectedRoutes)/(settings)/(userManagement)/addUser/AddUserApi";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_RAIL } from "@/app/config/layoutConstants";

/* ═════════════════════════════════════════════════════════════════════════
   MOCKUP TOKENS — every value copied verbatim from the approved HTML CSS
═════════════════════════════════════════════════════════════════════════ */
const M = {
  /* .sidebar */
  widthOpen: SIDEBAR_WIDTH,
  widthRail: SIDEBAR_WIDTH_RAIL,
  bg: "#1A2333",
  borderRight: "1px solid rgba(255,255,255,.06)",
  scrollbarThumb: "rgba(255,255,255,.15)",

  /* .sidebar-brand */
  brandPadding: "20px 18px 18px 18px",
  brandGap: "11px",
  logoBadgeSize: 36,
  logoBadgeRadius: "9px",
  logoBadgeBg: "rgba(255,255,255,.10)",
  logoBadgeBorder: "1px solid rgba(255,255,255,.14)",
  logoBadgeColor: "#C3CBDA",
  brandTextSize: "14.5px",
  brandTextWeight: 800,
  brandTextColor: "#fff",
  brandSubSize: "10.5px",
  brandSubColor: "#8B93A7",
  brandSubWeight: 600,

  /* .sidebar-divider */
  divider: "rgba(255,255,255,.08)",
  dividerMargin: "0 18px 10px 18px",

  /* nav.sidebar-nav */
  navPadding: "2px 12px",

  /* .nav-item */
  itemGap: "11px",
  itemMargin: "0",               // removes all vertical spacing between items
  itemPadding: "5.2px 10px",     // reduces inner height (default was 9px)
  itemRadius: "8px",
  itemColor: "#9AA4B8",
  itemWeight: 500,
  itemFontSize: "12px",
  itemIconColor: "#6B7488",
  itemIconSize: 19,
  itemHoverBg: "rgba(255,255,255,.06)",
  itemHoverColor: "#fff",

  /* .nav-item.active */
  activeBg: "#2563EB", // var(--secondary)
  activeHoverBg: "#1D4ED8", // var(--secondary-dark)
  activeWeight: 600,
  activeShadow: "0 1px 3px rgba(0,0,0,.25)",
  accentBar: "#0EA5E9", // var(--accent) — the little left edge bar
  accentBarLeftRoot: "-12px", // .nav-item.active::before  left:-12px
  accentBarLeftSub: "-25px", //  .nav-sub .nav-item.active::before left:-25px

  /* .nav-item .chevron */
  chevronSize: 18,
  chevronColor: "#6B7488",

  /* .nav-group-label */
  groupLabelSize: "10px",
  groupLabelWeight: 700,
  groupLabelSpacing: ".06em",
  groupLabelColor: "#6B7488",
  groupLabelPadding: "14px 11px 6px 11px",
  swatchSize: 6,

  /* .nav-sub */
  subBorder: "1px solid rgba(255,255,255,.10)",
  subMarginLeft: "19px",
  subPaddingLeft: "6px",
  subItemPaddingLeft: "16px",
  subItemFontSize: "12px",
  subItemIconSize: 16,
  subItemMargin: "0", // or "1px 0" to be tighter than root
  subItemPadding: "3.5px 11px", // smaller vertical padding than root's 6px

  /* .nav-badge */
  badgeBg: "#DC2626", // var(--error)
  badgeActiveBg: "rgba(255,255,255,.28)",
  badgeFontSize: "10.5px",
  badgeWeight: 700,
  badgeRadius: "9px",
  badgePadding: "1px 7px",
  badgeMinWidth: 18,

  /* .sidebar-collapse-btn */
  collapseBtnSize: 26,
  collapseBtnRadius: "7px",
  collapseBtnBg: "rgba(255,255,255,.07)",
  collapseBtnBorder: "1px solid rgba(255,255,255,.10)",
  collapseBtnColor: "#9AA4B8",
  collapseBtnHoverBg: "rgba(255,255,255,.14)",
  collapseBtnIconSize: 16,

  /* bottom well / footer */
  wellBorderTop: "1px solid rgba(255,255,255,.08)",
  scoutTextSize: "11px",
  scoutTextWeight: 800,
  scoutTextSpacing: ".1em",
  scoutTextColor: "#7A8398",
  footerFontSize: "10px",
  footerColor: "#5B6376",
  footerPadding: "6px 20px 16px 20px",
} as const;

const BRAND = {
  // TODO(multi-tenant): swap for the tenant's display name once exposed on
  // the user object / logo query response.
  orgNameFallback: "Customer Logo",
  subtitle: "Scout Platform",
  fallbackLogo: "/CustomerLogo1.png",
  //footerLogo: "/scoutLogo.png",
    footerLogo: "/icon.png",
  company: "Elansol Technologies",
} as const;

const COLLAPSED_STORAGE_KEY = "scout.sidebar.collapsed";

type MuiIcon = OverridableComponent<SvgIconTypeMap<object, "svg">>;

/* mockup .nav-group-label swatch colors per analytics category (dashboard v3
   category palette: safety=primary, surveillance=success, operational=warning,
   workforce=purple, facial=accent) */
const CATEGORY_SWATCH: Record<string, string> = {
  "Safety and Compliance": "#1E3A8A",
  "Surveillance Monitoring": "#16A34A",
  "Workforce Monitoring": "#8B5CF6",
  "Operational Insight": "#F59E0B",
  "Facial Recognition Analytics": "#0EA5E9",
};

const getItemIcon = (item: LinkMenuItem): MuiIcon =>
  item.icon ??
  (item.featureId ? FEATURE_ICON[item.featureId] : undefined) ??
  FiberManualRecord;

/* ═════════════════════════════════════════════════════════════════════════
   HELPERS
═════════════════════════════════════════════════════════════════════════ */
const isLink = (i: MenuItemConfig): i is LinkMenuItem => i.type === "link";
const isGroup = (i: MenuItemConfig): i is GroupMenuItem => i.type === "group";

const getAllLinkItems = (items: MenuItemConfig[]): LinkMenuItem[] =>
  items.flatMap((item) => {
    if (isLink(item)) return [item];
    if (isGroup(item)) return getAllLinkItems(item.items);
    return [];
  });

const pathMatches = (pathname: string, path?: string): boolean =>
  !!path && (pathname === path || pathname.startsWith(`${path}/`));

const containsPath = (items: MenuItemConfig[], pathname: string): boolean =>
  getAllLinkItems(items).some((l) => pathMatches(pathname, l.path));

/* ═════════════════════════════════════════════════════════════════════════
   LOCK BADGE (feature-gated rows)
═════════════════════════════════════════════════════════════════════════ */
const LockBadge = () => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      ml: "auto",
      width: 18,
      height: 18,
      borderRadius: "50%",
      backgroundColor: "rgba(255,255,255,.08)",
      flexShrink: 0,
    }}
  >
    <Lock sx={{ fontSize: "11px", color: M.itemIconColor }} />
  </Box>
);

/* ═════════════════════════════════════════════════════════════════════════
   NAV LINK  — mirrors .nav-item / .nav-sub .nav-item exactly
═════════════════════════════════════════════════════════════════════════ */
const NavLink = React.memo<{
  item: LinkMenuItem;
  pathname: string;
  features: string[];
  depth?: number; // 0 = root row, 1 = inside .nav-sub
  collapsed?: boolean;
}>(({ item, pathname, features, depth = 0, collapsed = false }) => {
  const enabled = hasFeature(features, item.featureId);
  const selected = pathMatches(pathname, item.path);
  const Icon = getItemIcon(item);
  const sub = depth > 0;

  let tooltip = "";
  if (!enabled) tooltip = `Upgrade your plan to access ${item.name}`;
  else if (collapsed) tooltip = item.name;

  return (
    <Tooltip title={tooltip} arrow placement="right">
      <span style={{ display: "block" }}>
        <ListItem disablePadding sx={{ m: sub ? M.subItemMargin : M.itemMargin }}>
          <ListItemButton
            component={enabled ? Link : "div"}
            href={enabled ? item.path : undefined}
            disabled={!enabled}
            selected={selected}
            aria-current={selected ? "page" : undefined}
            // sx={{
            //   gap: M.itemGap,
            //   padding: collapsed ? "9px 0" : (sub ? M.subItemPadding : M.itemPadding),
            //   paddingLeft: collapsed ? 0 : sub ? M.subItemPaddingLeft : undefined,
            //   justifyContent: collapsed ? "center" : "flex-start",
            //   borderRadius: M.itemRadius,
            //   color: enabled ? M.itemColor : M.itemIconColor,
            //   fontWeight: M.itemWeight,
            //   position: "relative",
            //   overflow: "visible",
            //   cursor: enabled ? "pointer" : "not-allowed",
            //   transition: "background-color .12s ease, color .12s ease",
            //   "&:hover": {
            //     backgroundColor: enabled ? M.itemHoverBg : "transparent",
            //     color: enabled ? M.itemHoverColor : undefined,
            //     "& .MuiListItemIcon-root": {
            //       color: enabled ? M.itemHoverColor : undefined,
            //     },
            //   },
            //   "&.Mui-disabled": { opacity: 1 },
            //   "&.Mui-focusVisible": {
            //     outline: `2px solid ${M.accentBar}`,
            //     outlineOffset: "-2px",
            //   },
            //   "&.Mui-selected": {
            //     backgroundColor: M.activeBg,
            //     color: "#fff",
            //     boxShadow: M.activeShadow,
            //     "&:hover": { backgroundColor: M.activeHoverBg },
            //     "& .MuiListItemIcon-root": { color: "#fff" },
            //     "&::before": {
            //       content: '""',
            //       position: "absolute",
            //       left: collapsed
            //         ? 0
            //         : sub
            //           ? M.accentBarLeftSub
            //           : M.accentBarLeftRoot,
            //       top: "22%",
            //       bottom: "22%",
            //       width: 3,
            //       borderRadius: "2px",
            //       backgroundColor: M.accentBar,
            //     },
            //   },
            // }}
            sx={{
  gap: M.itemGap,
  padding: collapsed ? "9px 0" : (sub ? M.subItemPadding : M.itemPadding),
  paddingLeft: collapsed ? 0 : sub ? M.subItemPaddingLeft : undefined,
  justifyContent: collapsed ? "center" : "flex-start",
  borderRadius: M.itemRadius,
  color: enabled ? M.itemColor : M.itemIconColor,
  fontWeight: M.itemWeight,
  position: "relative",
  overflow: "visible",
  cursor: enabled ? "pointer" : "not-allowed",
  transition: "background-color .12s ease, color .12s ease, opacity .12s ease",
  opacity: enabled ? 1 : 0.65,
  backgroundColor: enabled ? "transparent" : "rgba(255,255,255,.05)",
  "&:hover": {
    backgroundColor: enabled ? M.itemHoverBg : "rgba(255,255,255,.05)",
    color: enabled ? M.itemHoverColor : undefined,
    "& .MuiListItemIcon-root": {
      color: enabled ? M.itemHoverColor : undefined,
    },
  },
  "&.Mui-disabled": { opacity: 1 },
  "&.Mui-focusVisible": {
    outline: `2px solid ${M.accentBar}`,
    outlineOffset: "-2px",
  },
  "&.Mui-selected": {
    backgroundColor: M.activeBg,
    color: "#fff",
    boxShadow: M.activeShadow,
    "&:hover": { backgroundColor: M.activeHoverBg },
    "& .MuiListItemIcon-root": { color: "#fff" },
    "&::before": {
      content: '""',
      position: "absolute",
      left: collapsed ? 0 : sub ? M.accentBarLeftSub : M.accentBarLeftRoot,
      top: "22%",
      bottom: "22%",
      width: 3,
      borderRadius: "2px",
      backgroundColor: M.accentBar,
    },
  },
}}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                color: selected ? "#fff" : M.itemIconColor,
                transition: "color .12s ease",
              }}
            >
              <Icon
                sx={{ fontSize: sub ? M.subItemIconSize : M.itemIconSize }}
              />
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                disableTypography
                primary={
                  <Typography
                    component="span"
                    sx={{
                      fontSize: sub ? M.subItemFontSize : M.itemFontSize,
                      fontWeight: selected ? M.activeWeight : M.itemWeight,
                      color: "inherit",
                      whiteSpace: "normal", // labels WRAP — never clipped
                      wordBreak: "break-word",
                    }}
                  >
                    {item.name}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            )}

            {/* .nav-badge — red count pill (Alerts) */}
            {!collapsed && enabled && item.badge && (
              <Box
                component="span"
                sx={{
                  ml: "auto",
                  backgroundColor: selected ? M.badgeActiveBg : M.badgeBg,
                  color: "#fff",
                  fontSize: M.badgeFontSize,
                  fontWeight: M.badgeWeight,
                  borderRadius: M.badgeRadius,
                  padding: M.badgePadding,
                  minWidth: M.badgeMinWidth,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {item.badge}
              </Box>
            )}

            {!collapsed && !enabled && <LockBadge />}
          </ListItemButton>
        </ListItem>
      </span>
    </Tooltip>
  );
});
NavLink.displayName = "NavLink";

/* ═════════════════════════════════════════════════════════════════════════
   SECTION ROW (Monitoring / Analytics / Settings) — .nav-item + .chevron
═════════════════════════════════════════════════════════════════════════ */
const SectionRow = React.memo<{
  label: string;
  icon: MuiIcon;
  open: boolean;
  activeChild: boolean;
  collapsed: boolean;
  onClick: () => void;
}>(({ label, icon: Icon, open, activeChild, collapsed, onClick }) => (
  <Tooltip title={collapsed ? label : ""} arrow placement="right">
    <ListItem disablePadding sx={{ m: M.itemMargin }}>
      <ListItemButton
        onClick={onClick}
        aria-expanded={open}
        sx={{
          gap: M.itemGap,
          padding: collapsed ? "9px 0" : M.itemPadding,
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: M.itemRadius,
          color: activeChild ? M.itemHoverColor : M.itemColor,
          transition: "background-color .12s ease, color .12s ease",
          "&:hover": {
            backgroundColor: M.itemHoverBg,
            color: M.itemHoverColor,
            "& .MuiSvgIcon-root": { color: M.itemHoverColor },
          },
          "&.Mui-focusVisible": {
            outline: `2px solid ${M.accentBar}`,
            outlineOffset: "-2px",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            color: M.itemIconColor,
            transition: "color .12s ease",
          }}
        >
          <Icon sx={{ fontSize: M.itemIconSize }} />
        </ListItemIcon>
        {!collapsed && (
          <>
            <ListItemText
              disableTypography
              primary={
                <Typography
                  component="span"
                  sx={{
                    fontSize: M.itemFontSize,
                    fontWeight: M.itemWeight,
                    color: "inherit",
                  }}
                >
                  {label}
                </Typography>
              }
              sx={{ m: 0 }}
            />
            <ExpandMore
              sx={{
                ml: "auto",
                fontSize: M.chevronSize,
                color: M.chevronColor,
                transition: "transform .15s ease",
                transform: open ? "rotate(180deg)" : "none",
                flexShrink: 0,
              }}
            />
          </>
        )}
      </ListItemButton>
    </ListItem>
  </Tooltip>
));
SectionRow.displayName = "SectionRow";

/* ═════════════════════════════════════════════════════════════════════════
   SUB LIST (.nav-sub) — left guide line, exact indents
═════════════════════════════════════════════════════════════════════════ */
const SubList: React.FC<React.PropsWithChildren> = ({ children }) => (
  <List
    disablePadding
    sx={{
      ml: M.subMarginLeft,
      pl: M.subPaddingLeft,
      borderLeft: M.subBorder,
    }}
  >
    {children}
  </List>
);

/** .nav-group-label — uppercase micro-label with color swatch (used for Settings groups) */
const GroupLabel: React.FC<{ title: string; swatch?: string }> = ({
  title,
  swatch,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: M.groupLabelSize,
      fontWeight: M.groupLabelWeight,
      letterSpacing: M.groupLabelSpacing,
      textTransform: "uppercase",
      color: M.groupLabelColor,
      padding: M.groupLabelPadding,
    }}
  >
    {swatch && (
      <Box
        component="span"
        sx={{
          width: M.swatchSize,
          height: M.swatchSize,
          borderRadius: "2px",
          backgroundColor: swatch,
          flexShrink: 0,
        }}
      />
    )}
    {title}
  </Box>
);

/* ═════════════════════════════════════════════════════════════════════════
   SIDEBAR
═════════════════════════════════════════════════════════════════════════ */
type SectionKey = "monitoring" | "analytics" | "settings";

export interface SidebarProps {
  /** Live alert count from the alerts API / socket. Overrides the static
   *  badge value in menuConfig when provided. */

   alertCount?: number;

  /** Notified whenever the collapsed/rail state changes (including the
   *  initial value restored from localStorage), so parent layouts (e.g. the
   *  Header) can adjust their own width/offset to match. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ alertCount, onCollapsedChange }) => {
  const pathname = usePathname();
  const { features } = useAuth();

  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId: string = user?.org_id ?? "";
  const loggedInUser: string = user?.userId ?? "";

  const { data, isLoading } = useGetOrgAndUserLogoQuery(
    { LoggedInUserId: loggedInUser, tenantId },
    { skip: !loggedInUser || !tenantId },
  );
  const orgLogo = data?.logoPath?.orgLogo ?? BRAND.fallbackLogo;

  /* ── layout state — only one section open at a time (accordion) ── */
  const [collapsed, setCollapsedState] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    { monitoring: true, analytics: false, settings: false },
  );

  // State for accordion within Analytics categories (only one open at a time)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (saved !== null) setCollapsedState(saved === "1");
    } catch {
      /* storage unavailable — keep default */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onCollapsedChange?.(collapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      window.localStorage.setItem(COLLAPSED_STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* non-fatal */
    }
  }, []);

  /* ── config slices ─────────────────────────────────────────────────── */
  const dashboard = dashboardMenu[0];

  const monitoringItems = useMemo(
    () => dashboard.items.filter(isLink),
    [dashboard.items],
  );

  const dashboardRootItem = useMemo<LinkMenuItem>(
    () => ({
      type: "link",
      name: dashboard.title,
      icon: dashboard.icon ?? SpaceDashboardOutlinedIcon,
      path: dashboard.path ?? "/dashboard",
      featureId: dashboard.featureId,
    }),
    [dashboard],
  );

  // const liveNavItem = useMemo<LinkMenuItem | undefined>(() => {
  //   const item = liveStreamingMenu.find(isLink);
  //   return item && { ...item, icon: item.icon ?? VideoCallOutlinedIcon };
  // }, []);

  const alertNavItem = useMemo<LinkMenuItem | undefined>(() => {
    const item = alertMenu.find(isLink);
    if (!item) return undefined;
    return {
      ...item,
      icon: item.icon ?? WarningAmberOutlinedIcon,
      badge: alertCount !== undefined ? String(alertCount) : item.badge,
    };
  }, [alertCount]);

  const settingsItems = useMemo<MenuItemConfig[]>(
    () => settingsMenu[0]?.items ?? [],
    [],
  );

  /* ── active states ─────────────────────────────────────────────────── */
  const isMonitoringActive = useMemo(
    () => containsPath(monitoringItems, pathname),
    [monitoringItems, pathname],
  );
  const isAnalyticsActive = useMemo(
    () => analyticsMenu.some((c) => containsPath(c.items, pathname)),
    [pathname],
  );
  const isSettingsActive = useMemo(
    () => containsPath(settingsItems, pathname),
    [settingsItems, pathname],
  );

  /* ── route sync: open the owning section, close the rest (accordion) ── */
  useEffect(() => {
    if (isMonitoringActive)
      setOpenSections({ monitoring: true, analytics: false, settings: false });
    else if (isAnalyticsActive)
      setOpenSections({ monitoring: false, analytics: true, settings: false });
    else if (isSettingsActive)
      setOpenSections({ monitoring: false, analytics: false, settings: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Reset expanded category when Analytics section is closed
  useEffect(() => {
    if (!openSections.analytics) {
      setExpandedCategory(null);
    }
  }, [openSections.analytics]);

  const toggleSection = useCallback(
    (key: SectionKey) => {
      if (collapsed) {
        setCollapsed(false);
        setOpenSections({ monitoring: false, analytics: false, settings: false, [key]: true });
        return;
      }
      setOpenSections((p) => {
        const willOpen = !p[key];
        return { monitoring: false, analytics: false, settings: false, [key]: willOpen };
      });
    },
    [collapsed, setCollapsed],
  );

  const toggleCategory = useCallback((title: string) => {
    setExpandedCategory((prev) => (prev === title ? null : title));
  }, []);

  const handleLogoError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (!img.src.endsWith(BRAND.fallbackLogo)) img.src = BRAND.fallbackLogo;
    },
    [],
  );

  const width = collapsed ? M.widthRail : M.widthOpen;
  const year = new Date().getFullYear();

  /* ───────────────────────────────────────────────────────────────────── */
  return (
    <Drawer
      variant="permanent"
      PaperProps={{ component: "nav", "aria-label": "Main navigation" }}
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          height: "100vh",
          backgroundColor: M.bg,
          borderRight: M.borderRight,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          overflowY: "auto",
          transition: "width .2s ease",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          /* mockup scrollbar: 5px, rgba(255,255,255,.15) */
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-thumb": {
            background: M.scrollbarThumb,
            borderRadius: "4px",
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${M.scrollbarThumb} transparent`,
        },
      }}
    >
      {/* ── collapse button ── */}
      <IconButton
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        sx={{
          position: "absolute",
          top: collapsed ? "86px" : "20px",
          right: collapsed ? "auto" : "16px",
          left: collapsed ? "50%" : "auto",
          transform: collapsed ? "translateX(-50%)" : "none",
          width: M.collapseBtnSize,
          height: M.collapseBtnSize,
          borderRadius: M.collapseBtnRadius,
          backgroundColor: M.collapseBtnBg,
          border: M.collapseBtnBorder,
          color: M.collapseBtnColor,
          zIndex: 25,
          transition:
            "background-color .15s ease, color .15s ease, right .2s ease, top .2s ease, left .2s ease",
          "&:hover": {
            backgroundColor: M.collapseBtnHoverBg,
            color: "#fff",
          },
        }}
      >
        {collapsed ? (
          <ChevronRight sx={{ fontSize: M.collapseBtnIconSize }} />
        ) : (
          <ChevronLeft sx={{ fontSize: M.collapseBtnIconSize }} />
        )}
      </IconButton>

      {/* ── BRAND ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: M.brandGap,
          padding: collapsed ? "20px 0 18px 0" : M.brandPadding,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width={M.logoBadgeSize}
            height={M.logoBadgeSize}
            sx={{
              bgcolor: "rgba(255,255,255,.08)",
              borderRadius: M.logoBadgeRadius,
              flexShrink: 0,
            }}
          />
        ) : (
          <Box
            sx={{
              width: M.logoBadgeSize,
              height: M.logoBadgeSize,
              borderRadius: M.logoBadgeRadius,
              backgroundColor: M.logoBadgeBg,
              border: M.logoBadgeBorder,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={orgLogo}
              alt="Organization logo"
              onError={handleLogoError}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                p: "4px",
              }}
            />
          </Box>
        )}

        {!collapsed && (
          <Box sx={{ minWidth: 0, pr: "36px" /* clear the collapse btn */ }}>
            <Typography
              sx={{
                fontWeight: M.brandTextWeight,
                fontSize: M.brandTextSize,
                letterSpacing: "-.005em",
                color: M.brandTextColor,
                lineHeight: 1.25,
              }}
            >
              {BRAND.orgNameFallback}
            </Typography>
            <Typography
              sx={{
                fontSize: M.brandSubSize,
                color: M.brandSubColor,
                mt: "1px",
                fontWeight: M.brandSubWeight,
              }}
            >
              {BRAND.subtitle}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── divider ── */}
      <Box sx={{ height: "1px", backgroundColor: M.divider, m: M.dividerMargin }} />

      {/* ── NAV ── */}
      <List
        disablePadding
        sx={{
          padding: M.navPadding,
          flex: 1,
          mt: collapsed ? "34px" : 0,
        }}
      >
        {/* Dashboard */}
        <NavLink
          item={dashboardRootItem}
          pathname={pathname}
          features={features}
          collapsed={collapsed}
        />

        {/* Monitoring */}
        {monitoringItems.length > 0 && (
          <>
            <SectionRow
              label="Monitoring"
              icon={InsightsOutlinedIcon}
              open={openSections.monitoring}
              activeChild={isMonitoringActive}
              collapsed={collapsed}
              onClick={() => toggleSection("monitoring")}
            />
            {!collapsed && (
              <Collapse in={openSections.monitoring} timeout={200} unmountOnExit>
                <SubList>
                  {monitoringItems.map((item) => (
                    <NavLink
                      key={item.path}
                      item={item}
                      pathname={pathname}
                      features={features}
                      depth={1}
                    />
                  ))}
                </SubList>
              </Collapse>
            )}
          </>
        )}

        {/* Analytics — categories as collapsible accordion (only one open at a time) */}
        {analyticsMenu.length > 0 && (
          <>
            <SectionRow
              label="Analytics"
              icon={BarChart}
              open={openSections.analytics}
              activeChild={isAnalyticsActive}
              collapsed={collapsed}
              onClick={() => toggleSection("analytics")}
            />
            {!collapsed && (
              <Collapse in={openSections.analytics} timeout={200} unmountOnExit>
                <SubList>
                  {analyticsMenu.map((category) => {
                    const isOpen = expandedCategory === category.title;
                    const items = getAllLinkItems(category.items);
                    return (
                      <Box key={category.title}>
                        {/* Clickable category header */}
                        <ListItem disablePadding sx={{ m: M.itemMargin }}>
                          <ListItemButton
                            onClick={() => toggleCategory(category.title)}
                            sx={{
                              gap: M.itemGap,
                              padding: M.itemPadding,
                              borderRadius: M.itemRadius,
                              color: M.itemColor,
                              transition: "background-color .12s ease, color .12s ease",
                              "&:hover": {
                                backgroundColor: M.itemHoverBg,
                                color: M.itemHoverColor,
                              },
                            }}
                          >
                            {/* Color swatch */}
                            <Box
                              component="span"
                              sx={{
                                width: M.swatchSize,
                                height: M.swatchSize,
                                borderRadius: "2px",
                                backgroundColor: CATEGORY_SWATCH[category.title] || "#6B7488",
                                flexShrink: 0,
                              }}
                            />
                            {/* Label */}
                            <Typography
                              component="span"
                              sx={{
                                fontSize: M.groupLabelSize,
                                fontWeight: M.groupLabelWeight,
                                letterSpacing: M.groupLabelSpacing,
                                textTransform: "uppercase",
                                color: "inherit",
                              }}
                            >
                              {category.title}
                            </Typography>
                            {/* Chevron */}
                            <ExpandMore
                              sx={{
                                ml: "auto",
                                fontSize: M.chevronSize,
                                color: M.chevronColor,
                                transition: "transform .15s ease",
                                transform: isOpen ? "rotate(180deg)" : "none",
                                flexShrink: 0,
                              }}
                            />
                          </ListItemButton>
                        </ListItem>

                        {/* Collapsible items */}
                        <Collapse in={isOpen} timeout={200} unmountOnExit>
                          <Box>
                            {items.map((item) => (
                              <NavLink
                                key={item.path}
                                item={item}
                                pathname={pathname}
                                features={features}
                                depth={1}
                              />
                            ))}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </SubList>
              </Collapse>
            )}
          </>
        )}

        {/* Live Streaming */}
        {/* {liveNavItem && (
          <NavLink
            item={liveNavItem}
            pathname={pathname}
            features={features}
            collapsed={collapsed}
          />
        )} */}

        {/* Alerts */}
        {alertNavItem && (
          <NavLink
            item={alertNavItem}
            pathname={pathname}
            features={features}
            collapsed={collapsed}
          />
        )}

        {/* Settings */}
        {settingsItems.length > 0 && (
          <>
            <SectionRow
              label="Settings"
              icon={SettingsIcon}
              open={openSections.settings}
              activeChild={isSettingsActive}
              collapsed={collapsed}
              onClick={() => toggleSection("settings")}
            />
            {!collapsed && (
              <Collapse in={openSections.settings} timeout={200} unmountOnExit>
                <SubList>
                  {settingsItems.map((item) => {
                    if (isLink(item)) {
                      return (
                        <NavLink
                          key={item.path}
                          item={item}
                          pathname={pathname}
                          features={features}
                          depth={1}
                        />
                      );
                    }
                    if (isGroup(item)) {
                      return (
                        <Box key={item.name}>
                          <GroupLabel title={item.name} />
                          {getAllLinkItems(item.items).map((sub) => (
                            <NavLink
                              key={sub.path}
                              item={sub}
                              pathname={pathname}
                              features={features}
                              depth={1}
                            />
                          ))}
                        </Box>
                      );
                    }
                    return null;
                  })}
                </SubList>
              </Collapse>
            )}
          </>
        )}
      </List>

      {/* ── BOTTOM WELL ── */}
      {!collapsed && (
        <Box sx={{ borderTop: M.wellBorderTop, pt: "14px", mt: "6px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "6px 20px 4px 20px",
            }}
          >
            <Box
              component="img"
              src={BRAND.footerLogo}
              alt="Scout"
              loading="lazy"
              sx={{ width: 20, height: 22, objectFit: "contain", opacity: 0.8 }}
            />
            <Typography
              component="span"
              sx={{
                fontSize: M.scoutTextSize,
                fontWeight: M.scoutTextWeight,
                letterSpacing: M.scoutTextSpacing,
                color: M.scoutTextColor,
              }}
            >
              SCOUT
            </Typography>
          </Box>
          <Typography
            sx={{
              padding: M.footerPadding,
              fontSize: M.footerFontSize,
              color: M.footerColor,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            © {year} {BRAND.company}.
            <br />
            All rights reserved.
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default React.memo(Sidebar);