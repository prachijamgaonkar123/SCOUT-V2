import type { Meta, StoryObj } from "@storybook/react-vite";
import DashboardKpiCard from "./MonitoringDashboardKpiCard";

// Import icons for story examples
import { Warning, Shield, Visibility } from "@mui/icons-material";

const meta: Meta<typeof DashboardKpiCard> = {
  title: "Components/Molecules/DashboardKpiCard",
  component: DashboardKpiCard,
  tags: ["autodocs"],
  argTypes: {
    tooltipMessage: {
      control: "text",
    },
    route: {
      control: "text",
    },
    icon: {
      control: false, // icons are passed manually
    },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DashboardKpiCard>;

// ✅ Default example
export const Default: Story = {
  args: {
    title: "PPE Violations",
    violationsCount: 12,
    lastDetection: "Zone A - Gate 3",
    lastDetectionTime: "2025-10-08 09:45 AM",
    icon: Warning,
    tooltipMessage: "Shows total PPE violations detected today",
  },
};

// ✅ Zero Violations example (green theme)
export const NoViolations: Story = {
  args: {
    title: "Gas Leak Violations",
    violationsCount: 0,
    lastDetection: "Zone B - Basement",
    lastDetectionTime: "2025-10-08 08:30 AM",
    icon: Shield,
    tooltipMessage: "No gas leak detected in last 24 hours",
  },
};

// ✅ High Violations example (red theme)
export const HighViolations: Story = {
  args: {
    title: "Fire Alerts",
    violationsCount: 28,
    lastDetection: "Zone C - Control Room",
    lastDetectionTime: "2025-10-08 07:10 AM",
    icon: Visibility,
    tooltipMessage: "Critical number of fire alerts detected",
  },
};

// ✅ With Navigation Route (View button visible)
export const WithRoute: Story = {
  args: {
    title: "Smoke Detections",
    violationsCount: 5,
    lastDetection: "Zone D - Corridor 1",
    lastDetectionTime: "2025-10-08 06:55 AM",
    icon: Warning,
    route: "/dashboard/smoke-alerts",
    tooltipMessage: "Click view to open smoke detection dashboard",
  },
};

// ✅ Different Sizes
export const SmallSize: Story = {
  args: {
    title: "Oil Leak Alerts",
    violationsCount: 3,
    lastDetection: "Zone E - Pump Room",
    lastDetectionTime: "2025-10-08 06:10 AM",
    icon: Shield,
  },
};

export const LargeSize: Story = {
  args: {
    title: "Intrusion Alerts",
    violationsCount: 9,
    lastDetection: "Zone F - Main Entry",
    lastDetectionTime: "2025-10-08 09:00 AM",
    icon: Visibility,
  },
};
