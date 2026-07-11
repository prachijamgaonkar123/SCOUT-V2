// app/config/dashboardTheme.ts
// Color tokens copied verbatim from the approved dashboard mockup's :root
// CSS variables — shared by the Dashboard v3 components (StatCard,
// AIUseCaseOverview, DetectionTrendChart, EventCard, UseCase*, UpgradeBanner)
// so every card uses the exact same palette.

import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material/SvgIcon";

export type MuiIcon = OverridableComponent<SvgIconTypeMap<object, "svg">>;

// Values resolve through CSS custom properties defined in globals.css
// (:root for light, [data-theme='dark'] for dark) so every component that
// consumes DASHBOARD_COLORS picks up dark mode automatically.
export const DASHBOARD_COLORS = {
  primary: "var(--sd-primary)",
  primaryDark: "var(--sd-primary-dark)",
  primaryTint: "var(--sd-primary-tint)",
  secondary: "var(--sd-secondary)",
  secondaryDark: "var(--sd-secondary-dark)",
  accent: "var(--sd-accent)",
  accentTint: "var(--sd-accent-tint)",
  success: "var(--sd-success)",
  successTint: "var(--sd-success-tint)",
  warning: "var(--sd-warning)",
  warningTint: "var(--sd-warning-tint)",
  warningText: "var(--sd-warning-text)",
  error: "var(--sd-error)",
  errorTint: "var(--sd-error-tint)",
  workforce: "var(--sd-workforce)",
  workforceTint: "var(--sd-workforce-tint)",
  bg: "var(--sd-bg)",
  card: "var(--sd-card)",
  border: "var(--sd-border)",
  textPrimary: "var(--sd-text-primary)",
  textSecondary: "var(--sd-text-secondary)",
  hover: "var(--sd-hover)",
  gray: "var(--sd-gray)",
  grayText: "var(--sd-gray-text)",
} as const;

/** AI Use Case categories used across the top donut, trend chart, and status grid. */
export type UseCaseCategory =
  | "safety"
  | "surveillance"
  | "operational"
  | "workforce";

export const CATEGORY_LABEL: Record<UseCaseCategory, string> = {
  safety: "Safety & Compliance",
  surveillance: "Surveillance Monitoring",
  operational: "Operational Insights",
  workforce: "Workforce Monitoring",
};

export const CATEGORY_COLOR: Record<UseCaseCategory, string> = {
  safety: DASHBOARD_COLORS.primary,
  surveillance: DASHBOARD_COLORS.success,
  operational: DASHBOARD_COLORS.warning,
  workforce: DASHBOARD_COLORS.workforce,
};

export const CATEGORY_TINT: Record<UseCaseCategory, string> = {
  safety: DASHBOARD_COLORS.primaryTint,
  surveillance: DASHBOARD_COLORS.successTint,
  operational: DASHBOARD_COLORS.warningTint,
  workforce: DASHBOARD_COLORS.workforceTint,
};
